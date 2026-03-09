import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import listingRoutes from './listingRoutes';
import adminListingRoutes from './adminListingRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

// API Root - Welcome endpoint
router.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        name: 'Lendii FWP Backend API',
        version: 'v1',
        status: 'operational',
        documentation: 'https://github.com/lendii/backend/README.md',
        endpoints: {
            auth: [
                'POST /auth/magic-link',
                'GET /auth/callback',
                'GET /auth/session',
                'POST /auth/logout'
            ],
            catalog: [
                'GET /listings',
                'GET /listings/:id',
                'GET /listings/:id/availability'
            ],
            admin_listings: [
                'POST /admin/listings',
                'PATCH /admin/listings/:id',
                'POST /admin/listings/:id/publish',
                'POST /admin/listings/:id/unpublish',
                'DELETE /admin/listings/:id'
            ],
            booking: [
                'POST /bookings/validate',
                'POST /checkout/create-session',
                'GET /checkout/success',
                'GET /checkout/cancel'
            ],
            orders: [
                'GET /orders',
                'GET /orders/:id',
                'GET /admin/orders',
                'GET /admin/orders/:id',
                'PATCH /admin/orders/:id/ship',
                'PATCH /admin/orders/:id/complete',
                'POST /admin/orders/:id/refund',
                'PATCH /admin/orders/:id/notes'
            ],
            admin_dashboard: [
                'GET /admin/dashboard/stats',
                'GET /admin/dashboard/recent-orders'
            ],
            payments: [
                'POST /webhooks/stripe',
                'GET /payments/transactions'
            ],
            utilities: [
                'GET /health',
                'GET /meta/enums'
            ]
        }
    });
});

// Health check
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// System enums
router.get('/meta/enums', (req: Request, res: Response) => {
    res.status(200).json({
        listingStatuses: ['draft', 'published', 'rented', 'archived'],
        categories: ['dresses', 'tops', 'bottoms', 'outerwear', 'accessories', 'shoes'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        conditions: ['new', 'excellent', 'good', 'fair'],
        orderStatuses: ['pending', 'confirmed', 'shipped', 'delivered', 'returned', 'completed', 'cancelled', 'refunded'],
        paymentStatuses: ['pending', 'completed', 'failed', 'refunded'],
        userRoles: ['admin', 'borrower']
    });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/admin/listings', adminListingRoutes);
router.use('/', orderRoutes); // bookings, checkout, orders, admin routes
router.use('/', paymentRoutes); // webhooks, payments

export default router;
