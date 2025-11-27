import express from 'express';
import {
  salesReport,
  pendingShipmentsReport,
  pendingDocumentsReport,
  leadTimesReport,
  exportCSV
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.get('/sales', protect, authorize('admin', 'manager'), salesReport);
router.get('/pending-shipments', protect, authorize('admin', 'manager'), pendingShipmentsReport);
router.get('/pending-documents', protect, authorize('admin', 'manager'), pendingDocumentsReport);
router.get('/lead-times', protect, authorize('admin', 'manager'), leadTimesReport);
router.get('/export-csv', protect, authorize('admin', 'manager'), exportCSV);

export default router;
