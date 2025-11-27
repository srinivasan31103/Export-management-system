import express from 'express';
import { createShipment, getShipments, getShipmentById, updateShipment, trackShipment } from '../controllers/shipmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager', 'clerk'), createShipment);
router.get('/', protect, getShipments);
router.get('/:id', protect, getShipmentById);
router.put('/:id', protect, authorize('admin', 'manager', 'clerk'), updateShipment);
router.get('/:id/track', protect, trackShipment);

export default router;
