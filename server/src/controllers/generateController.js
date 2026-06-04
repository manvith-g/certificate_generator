import Papa from 'papaparse';
import { renderCertificatePNG, renderCertificatePDF } from '../services/renderEngine.js';
import archiver from 'archiver';

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
      trimHeaders: true
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
        // Also keep original row data for the renderer just in case
        normalizedRow._original = row;
        return normalizedRow;
      });

    if (dataRows.length === 0) {
      return res.status(400).json({ error: 'CSV is empty.' });
    }

    // Set up zip streaming response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="certificates.zip"`);

    const archive = archiver('zip', { zlib: { level: 5 } });
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Failed to create zip stream.' });
    });

    archive.pipe(res);

    const renderer = outputFormat === 'pdf' ? renderCertificatePDF : renderCertificatePNG;
    const ext = outputFormat === 'pdf' ? 'pdf' : 'png';

    // Generate certificates in memory and append to zip stream
    for (let i = 0; i < dataRows.length; i++) {
      const rowData = dataRows[i];
      // Generate a filename based on Name or Name/Email column if present, else just index
      let filenameBase = rowData['name'] || rowData['full name'] || rowData['fullname'] || `certificate_${i + 1}`;
      // Clean filename
      filenameBase = filenameBase.replace(/[^a-z0-9_-]/gi, '_');

      try {
        const certBuffer = outputFormat === 'pdf' 
          ? await renderCertificatePDF(templateFile.buffer, templateFile.mimetype, fields, rowData, templateWidth, templateHeight)
          : await renderCertificatePNG(templateFile.buffer, fields, rowData, templateWidth, templateHeight);
          
        archive.append(certBuffer, { name: `${filenameBase}.${ext}` });
      } catch (err) {
        console.error(`Error generating row ${i + 1}:`, err);
        // Add a text file indicating the error for this specific row so the zip still completes
        archive.append(Buffer.from(`Error generating certificate: ${err.message}`), { name: `ERROR_${filenameBase}.txt` });
      }
    }

    // Finalize the zip (this triggers the end of the response stream)
    await archive.finalize();

  } catch (err) {
    console.error('Generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred during generation.' });
    }
  }
};
