import express from 'express';
import multer from 'multer';
import { importOrders, importSKUs } from '../controllers/importController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.post('/orders', protect, authorize('admin', 'manager'), upload.single('file'), importOrders);
router.post('/skus', protect, authorize('admin', 'manager'), upload.single('file'), importSKUs);

export default router;
