import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe webhook (no authentication - Stripe signature validation)
router.post('/webhooks/stripe', paymentController.handleStripeWebhook);

// Get user transactions
router.get('/payments/transactions', authenticate, paymentController.getTransactions);

export default router;
