import express from 'express';
import { createQuote, getQuote, getQuotes, updateQuote, deleteQuote, calculateLanded } from '../controllers/quoteController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager', 'clerk'), createQuote);
router.get('/', protect, getQuotes);
router.get('/:id', protect, getQuote);
router.put('/:id', protect, authorize('admin', 'manager', 'clerk'), updateQuote);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteQuote);
router.post('/landed-cost', protect, calculateLanded);

export default router;
