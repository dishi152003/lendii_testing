import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { stripeService } from '../services/stripeService';
import { asyncHandler } from '../middleware/errorHandler';

export class PaymentController {
    // POST /api/v1/webhooks/stripe
    handleStripeWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const signature = req.headers['stripe-signature'] as string;
        const payload = JSON.stringify(req.body);

        await stripeService.handleWebhook(payload, signature);

        res.status(200).json({ received: true });
    });

    // GET /api/v1/payments/transactions
    getTransactions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const transactions = await stripeService.getTransactions(req.user!.id);

        res.status(200).json({
            success: true,
            data: transactions,
            count: transactions.length
        });
    });
}

export const paymentController = new PaymentController();
