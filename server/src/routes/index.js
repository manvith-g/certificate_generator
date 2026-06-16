import { Router } from 'express';
import multer from 'multer';
import { generateCertificates, getProgress, downloadResult } from '../controllers/generateController.js';
import { AVAILABLE_FONTS, PREDEFINED_FIELDS } from '../utils/constants.js';

const router = Router();

// Configure multer for memory storage
// Using memory storage for the initial upload — the batch processor
// writes the output ZIP to disk to avoid holding everything in RAM.
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// Start generation job — accepts template + csv + fields
router.post('/generate', upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'csv', maxCount: 1 }
]), generateCertificates);

// Poll generation progress
router.get('/generate/progress/:jobId', getProgress);

// Download completed ZIP
router.get('/generate/download/:jobId', downloadResult);

// Utility endpoints for the editor
router.get('/fonts', (req, res) => {
  res.json({ success: true, data: AVAILABLE_FONTS });
});

router.get('/fields/predefined', (req, res) => {
  res.json({ success: true, data: PREDEFINED_FIELDS });
});

export default router;
