import express from 'express';
import { getTransactions, createTransaction } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), getTransactions);
router.post('/', protect, authorize('admin', 'manager'), createTransaction);

export default router;
