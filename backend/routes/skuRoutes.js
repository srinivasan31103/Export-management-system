import express from 'express';
import { createSKU, getSKUs, getSKUById, updateSKU, deleteSKU } from '../controllers/skuController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager'), createSKU);
router.get('/', protect, getSKUs);
router.get('/:id', protect, getSKUById);
router.put('/:id', protect, authorize('admin', 'manager'), updateSKU);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteSKU);

export default router;
