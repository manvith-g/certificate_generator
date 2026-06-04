import { createCanvas, loadImage, registerFont } from 'canvas';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { installFontsForCurrentUser } from './installFontsWindows.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontsDir = path.resolve(__dirname, '../../fonts');

// Font cache
const registeredFonts = new Set();
const fontBufferCache = new Map();

/**
 * Register a font file with node-canvas.
 */
function registerFontSafe(fontPath, family, weight = 'normal', style = 'normal') {
  const key = `${family}-${weight}-${style}`;
  if (registeredFonts.has(key)) return;
  
  if (fs.existsSync(fontPath)) {
    try {
      registerFont(fontPath, { family, weight, style });
      registeredFonts.add(key);
    } catch (err) { /* font registration failed – continue with fallback */ }
  }
}

/**
 * Initialize all bundled fonts.
 */
export function initFonts() {
  if (!fs.existsSync(fontsDir)) {
    console.warn('Fonts directory not found:', fontsDir);
    return;
  }

  // On Windows, install fonts at the user level so Pango can discover them.
  // This fixes the "couldn't load font ... falling back to Sans" error.
  installFontsForCurrentUser(fontsDir);
  
  const fontFiles = fs.readdirSync(fontsDir).filter(f => f.endsWith('.ttf'));

  // Helper: derive a spaced family name from a filename
  // e.g. "DancingScript-Regular.ttf" → "Dancing Script"
  //      "PlayfairDisplay-Regular.ttf" → "Playfair Display"
  //      "Poppins-Bold.ttf" → "Poppins"
  function deriveFamilyName(file) {
    const raw = file
      .replace(/\.ttf$/i, '')
      .replace(/[-_]?(Regular|Bold|Italic|BoldItalic|Light|Medium|SemiBold|ExtraBold|Black|Thin)$/i, '')
      .replace(/[-_]/g, ''); // strip leftover separators before CamelCase split
    // CamelCase → spaced: "DancingScript" → "Dancing Script"
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  }

  // Pass 1: find which families have a dedicated bold file
  const familiesWithBold = new Set();
  for (const file of fontFiles) {
    if (file.toLowerCase().includes('bold')) {
      familiesWithBold.add(deriveFamilyName(file));
    }
  }

  // Pass 2: register all fonts
  for (const file of fontFiles) {
    const fontPath = path.join(fontsDir, file);
    const lowerFile = file.toLowerCase();
    const family = deriveFamilyName(file);

    let weight = 'normal';
    let style = 'normal';
    if (lowerFile.includes('bold')) weight = 'bold';
    if (lowerFile.includes('italic')) style = 'italic';

    // Register under its natural weight/style
    registerFontSafe(fontPath, family, weight, style);

    // For Regular fonts whose family has NO dedicated bold file, also register
    // the Regular under 'bold' so bold requests don't silently fall back to
    // the system font. We skip this for families that DO have a bold file
    // (e.g. Poppins) so we don't block the real bold file from registering.
    if (weight === 'normal' && style === 'normal' && !familiesWithBold.has(family)) {
      registerFontSafe(fontPath, family, 'bold', 'normal');
    }

    // Cache buffer for pdf-lib
    fontBufferCache.set(file, fs.readFileSync(fontPath));
  }

}

/**
 * Render a single certificate as PNG using node-canvas.
 */
export async function renderCertificatePNG(templateBuffer, fields, participantData, templateWidth, templateHeight) {
  // Load template image from buffer
  const img = await loadImage(templateBuffer);
  const width = templateWidth || img.width;
  const height = templateHeight || img.height;
  
  // Create canvas at original resolution
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw template as background
  ctx.drawImage(img, 0, 0, width, height);
  
  // Draw each field
  for (const field of fields) {
    const key = (field.field_key || '').toLowerCase();
    const text = participantData[key] || participantData._original?.[field.field_key] || '';
    if (!text) continue;
    
    const actualX = field.x * width;
    const actualY = field.y * height;
    const fontSize = Math.round((field.font_size || 32) * (field.scale_x || 1));
    const fontFamily = field.font_family || 'Arial';
    const isBold = field.font_weight === 'bold';
    const isItalic = field.font_style === 'italic';

    ctx.save();

    // Rotation
    if (field.rotation) {
      ctx.translate(actualX, actualY);
      ctx.rotate((field.rotation * Math.PI) / 180);
      ctx.translate(-actualX, -actualY);
    }

    // Build the minimal valid CSS font string — omit 'normal' keywords so
    // node-canvas has a clean string to parse.
    // e.g. "bold 32px 'Roboto'" or "italic bold 32px 'Dancing Script'"
    const fontParts = [];
    if (isItalic) fontParts.push('italic');
    if (isBold)   fontParts.push('bold');
    fontParts.push(`${fontSize}px`);
    fontParts.push(`'${fontFamily}', Arial, sans-serif`);
    const fontStr = fontParts.join(' ');

    ctx.font = fontStr;
    ctx.fillStyle = field.font_color || '#000000';
    ctx.textAlign = field.text_align || 'center';
    ctx.textBaseline = 'middle';
    
    // Letter spacing
    if (field.letter_spacing && field.letter_spacing !== 0) {
      drawTextWithSpacing(ctx, text, actualX, actualY, field.letter_spacing);
    } else {
      ctx.fillText(text, actualX, actualY);
    }
    
    ctx.restore();
  }
  
  return canvas.toBuffer('image/png');
}

/**
 * Render a single certificate as PDF using pdf-lib.
 */
export async function renderCertificatePDF(templateBuffer, mimetype, fields, participantData, templateWidth, templateHeight) {
  const pdfDoc = await PDFDocument.create();
  
  let templateImage;
  if (mimetype === 'image/png') {
    templateImage = await pdfDoc.embedPng(templateBuffer);
  } else if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
    templateImage = await pdfDoc.embedJpg(templateBuffer);
  } else {
    // For PDF templates, merge pages
    const existingPdf = await PDFDocument.load(templateBuffer);
    const [copiedPage] = await pdfDoc.copyPages(existingPdf, [0]);
    pdfDoc.addPage(copiedPage);
    // TODO: overlay text on existing PDF page
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
  
  const width = templateWidth || templateImage.width;
  const height = templateHeight || templateImage.height;
  
  // Add page with template dimensions
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(templateImage, { x: 0, y: 0, width, height });
  
  // Embed a standard font (custom font embedding requires fontkit)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Draw fields
  for (const field of fields) {
    const text = participantData[field.field_key] || '';
    if (!text) continue;
    
    const actualX = field.x * width;
    // PDF coordinate system: origin at bottom-left
    const actualY = height - (field.y * height);
    const fontSize = Math.round((field.font_size || 32) * (field.scale_x || 1));
    const selectedFont = field.font_weight === 'bold' ? fontBold : font;
    
    const color = hexToRgb(field.font_color || '#000000');
    
    const textWidth = selectedFont.widthOfTextAtSize(text, fontSize);
    let drawX = actualX;
    if (field.text_align === 'center') {
      drawX = actualX - textWidth / 2;
    } else if (field.text_align === 'right') {
      drawX = actualX - textWidth;
    }
    
    page.drawText(text, {
      x: drawX,
      y: actualY - fontSize / 2,
      size: fontSize,
      font: selectedFont,
      color: rgb(color.r, color.g, color.b),
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Process an entire batch of certificates.
 */
export async function generateBatch(batchId, templatePath, fields, dataRows, outputFormat, templateWidth, templateHeight, onProgress) {
  const batchOutputDir = getOutputPath(batchId);
  ensureDir(batchOutputDir);
  
  const results = [];
  const renderer = outputFormat === 'pdf' ? renderCertificatePDF : renderCertificatePNG;
  const ext = outputFormat === 'pdf' ? '.pdf' : '.png';
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    try {
      const buffer = await renderer(templatePath, fields, row.data, templateWidth, templateHeight);
      const filename = `certificate_${i + 1}${ext}`;
      const filePath = path.join(batchOutputDir, filename);
      writeFileBuffer(filePath, buffer);
      
      results.push({
        certId: row.certId,
        filePath,
        filename,
        status: 'completed',
      });
      
      if (onProgress) {
        onProgress(i + 1, dataRows.length);
      }
    } catch (err) {
      console.error(`Error generating certificate ${i + 1}:`, err);
      results.push({
        certId: row.certId,
        filePath: null,
        filename: null,
        status: 'failed',
      });
    }
  }
  
  return results;
}

// --- Helpers ---

function drawTextWithSpacing(ctx, text, x, y, spacing) {
  const chars = text.split('');
  let currentX = x;
  
  // Adjust start for center alignment
  if (ctx.textAlign === 'center') {
    const totalWidth = chars.reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing);
    currentX = x - totalWidth / 2;
    ctx.textAlign = 'left';
  }
  
  for (const char of chars) {
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0, g: 0, b: 0 };
}
