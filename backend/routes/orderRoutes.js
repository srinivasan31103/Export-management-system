import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager', 'clerk'), createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, authorize('admin', 'manager', 'clerk'), updateOrder);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteOrder);

export default router;
