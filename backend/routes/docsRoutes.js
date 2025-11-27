import express from 'express';
import multer from 'multer';
import {
  generateInvoice,
  generatePackingListDoc,
  generateCOO,
  generateBL,
  getOrderDocuments,
  uploadDocument
} from '../controllers/docsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Multer config for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  }
});

router.get('/order/:orderId/invoice', protect, generateInvoice);
router.get('/order/:orderId/packing-list', protect, generatePackingListDoc);
router.get('/order/:orderId/certificate-of-origin', protect, generateCOO);
router.get('/shipment/:shipmentId/bill-of-lading', protect, generateBL);
router.get('/order/:orderId', protect, getOrderDocuments);
router.post('/upload', protect, upload.single('file'), uploadDocument);

export default router;
