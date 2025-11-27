import express from 'express';
import { createBuyer, getBuyers, getBuyerById, updateBuyer, deleteBuyer } from '../controllers/buyerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager'), createBuyer);
router.get('/', protect, getBuyers);
router.get('/:id', protect, getBuyerById);
router.put('/:id', protect, authorize('admin', 'manager'), updateBuyer);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteBuyer);

export default router;
