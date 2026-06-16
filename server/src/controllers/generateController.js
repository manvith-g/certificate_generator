import Papa from 'papaparse';
import { renderCertificatePNG, renderCertificatePDF } from '../services/renderEngine.js';
import archiver from 'archiver';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.resolve(__dirname, '../../temp');

// In-memory job store
const jobs = new Map();

// Batch size — process this many certificates at a time before freeing memory
const BATCH_SIZE = 10;

// Auto-cleanup after 10 minutes
const CLEANUP_DELAY_MS = 10 * 60 * 1000;

/**
 * POST /api/generate
 * Accepts template, CSV, and fields. Kicks off async batch processing.
 * Returns { jobId, totalRows } immediately.
 */
export const generateCertificates = async (req, res) => {
  try {
    const templateFile = req.files?.template?.[0];
    const csvFile = req.files?.csv?.[0];
    const fieldsStr = req.body.fields;
    const outputFormat = req.body.format || 'png';
    const templateWidth = parseInt(req.body.templateWidth, 10);
    const templateHeight = parseInt(req.body.templateHeight, 10);

    if (!templateFile || !csvFile || !fieldsStr) {
      return res.status(400).json({ error: 'Missing template, csv, or fields.' });
    }

    let fields = [];
    try {
      fields = JSON.parse(fieldsStr);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid fields JSON format.' });
    }

    // Parse CSV from buffer
    const csvString = csvFile.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ error: 'Failed to parse CSV.', details: parseResult.errors });
    }

    // Normalize headers to lowercase for robust matching
    const dataRows = parseResult.data
      .filter(row => Object.values(row).some(val => val && val.trim() !== ''))
      .map(row => {
        const normalizedRow = {};
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          }
        }
        normalizedRow._original = row;
        return normalizedRow;
      });

    if (dataRows.length === 0) {
      return res.status(400).json({ error: 'CSV is empty.' });
    }

    // Free CSV buffer immediately — we've parsed it
    csvFile.buffer = null;

    // Create job
    const jobId = randomUUID();
    const zipPath = path.join(tempDir, `${jobId}.zip`);

    const job = {
      id: jobId,
      status: 'processing',
      completed: 0,
      total: dataRows.length,
      error: null,
      zipPath,
      createdAt: Date.now(),
    };

    jobs.set(jobId, job);

    // Respond immediately with job info
    res.json({ jobId, totalRows: dataRows.length });

    // Kick off async processing (don't await — fire and forget)
    processJob(job, templateFile, fields, dataRows, outputFormat, templateWidth, templateHeight);

  } catch (err) {
    console.error('Generation start error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred starting generation.' });
    }
  }
};

/**
 * GET /api/generate/progress/:jobId
 * Returns current progress for a job.
 */
export const getProgress = (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  res.json({
    status: job.status,
    completed: job.completed,
    total: job.total,
    error: job.error,
  });
};

/**
 * GET /api/generate/download/:jobId
 * Streams the completed ZIP file to the client.
 */
export const downloadResult = (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  if (job.status !== 'done') {
    return res.status(400).json({ error: 'Job is not complete yet.', status: job.status });
  }

  if (!fs.existsSync(job.zipPath)) {
    return res.status(410).json({ error: 'ZIP file has expired or been cleaned up.' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="certificates.zip"`);

  const stream = fs.createReadStream(job.zipPath);
  stream.pipe(res);

  stream.on('error', (err) => {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream ZIP file.' });
    }
  });

  // Schedule cleanup after download starts
  stream.on('end', () => {
    scheduleCleanup(jobId, 60_000); // clean up 1 min after download
  });
};

/**
 * Async batch processor — runs in the background after the POST response.
 */
async function processJob(job, templateFile, fields, dataRows, outputFormat, templateWidth, templateHeight) {
  let archive;
  let outputStream;

  try {
    // Create a write stream to disk for the ZIP
    outputStream = fs.createWriteStream(job.zipPath);
    archive = archiver('zip', { zlib: { level: 5 } });

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      job.status = 'error';
      job.error = 'Failed to create ZIP archive.';
    });

    archive.pipe(outputStream);

    const renderer = outputFormat === 'pdf' ? renderCertificatePDF : renderCertificatePNG;
    const ext = outputFormat === 'pdf' ? 'pdf' : 'png';

    // Process in batches to control memory
    for (let batchStart = 0; batchStart < dataRows.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, dataRows.length);

      // Process each certificate in the current batch
      for (let i = batchStart; i < batchEnd; i++) {
        const rowData = dataRows[i];

        // Generate filename
        let filenameBase = rowData['name'] || rowData['full name'] || rowData['fullname'] || `certificate_${i + 1}`;
        filenameBase = filenameBase.replace(/[^a-z0-9_-]/gi, '_');

        try {
          let certBuffer;
          if (outputFormat === 'pdf') {
            certBuffer = await renderCertificatePDF(templateFile.buffer, templateFile.mimetype, fields, rowData, templateWidth, templateHeight);
          } else {
            certBuffer = await renderCertificatePNG(templateFile.buffer, fields, rowData, templateWidth, templateHeight);
          }

          archive.append(certBuffer, { name: `${filenameBase}.${ext}` });

          // Explicitly release buffer reference
          certBuffer = null;
        } catch (err) {
          console.error(`Error generating row ${i + 1}:`, err);
          archive.append(Buffer.from(`Error generating certificate: ${err.message}`), {
            name: `ERROR_${filenameBase}.txt`,
          });
        }

        // Update progress after each certificate
        job.completed = i + 1;
      }

      // After each batch, free references to processed row data and hint GC
      for (let i = batchStart; i < batchEnd; i++) {
        dataRows[i] = null;
      }

      // Give the event loop a breath between batches
      await new Promise(resolve => setImmediate(resolve));
    }

    // Finalize the archive
    await archive.finalize();

    // Wait for the output stream to finish writing
    await new Promise((resolve, reject) => {
      outputStream.on('close', resolve);
      outputStream.on('error', reject);
    });

    job.status = 'done';

    // Schedule auto-cleanup in case the client never downloads
    scheduleCleanup(job.id, CLEANUP_DELAY_MS);

  } catch (err) {
    console.error('Job processing error:', err);
    job.status = 'error';
    job.error = err.message || 'Unknown processing error.';

    // Clean up partial ZIP on error
    try {
      if (archive) archive.abort();
      if (outputStream) outputStream.close();
      if (fs.existsSync(job.zipPath)) fs.unlinkSync(job.zipPath);
    } catch (cleanupErr) {
      console.error('Cleanup after error failed:', cleanupErr);
    }
  }
}

/**
 * Schedule cleanup for a job's ZIP file and metadata.
 */
function scheduleCleanup(jobId, delayMs) {
  setTimeout(() => {
    const job = jobs.get(jobId);
    if (job) {
      try {
        if (fs.existsSync(job.zipPath)) {
          fs.unlinkSync(job.zipPath);
        }
      } catch (err) {
        console.error(`Cleanup error for job ${jobId}:`, err);
      }
      jobs.delete(jobId);
    }
  }, delayMs);
}
