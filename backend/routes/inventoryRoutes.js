import express from 'express';
import { getInventory, reserveInventory, adjustInventory, createInventory } from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.post('/reserve', protect, authorize('admin', 'manager', 'clerk'), reserveInventory);
router.post('/adjust', protect, authorize('admin', 'manager'), adjustInventory);
router.post('/', protect, authorize('admin', 'manager'), createInventory);

export default router;
