import express from 'express';
import { carrierWebhook, paymentWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Webhooks don't require authentication (they validate via signatures in production)
router.post('/carrier', carrierWebhook);
router.post('/payment', paymentWebhook);

export default router;
