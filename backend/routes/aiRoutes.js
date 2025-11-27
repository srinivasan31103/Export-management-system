import express from 'express';
import { hsClassify, docSummary, businessInsights, suggestImprovements } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/hs-classify', protect, hsClassify);
router.post('/doc-summary', protect, docSummary);
router.post('/business-insights', protect, businessInsights);
router.post('/suggest-improvements', protect, suggestImprovements);

export default router;
