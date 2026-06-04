import { Router } from 'express';
import multer from 'multer';
import { generateCertificates } from '../controllers/generateController.js';
import { AVAILABLE_FONTS, PREDEFINED_FIELDS } from '../utils/constants.js';

const router = Router();

// Configure multer for memory storage or temp disk storage
// Using disk storage because template and CSV might be large, but memory is fine for typical sizes.
// We'll use memory storage for simplicity and speed, avoiding file system I/O if possible.
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// Single endpoint that takes template (image/pdf), csv (file), and fields (json string)
router.post('/generate', upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'csv', maxCount: 1 }
]), generateCertificates);

// Utility endpoints for the editor
router.get('/fonts', (req, res) => {
  res.json({ success: true, data: AVAILABLE_FONTS });
});

router.get('/fields/predefined', (req, res) => {
  res.json({ success: true, data: PREDEFINED_FIELDS });
});

export default router;
