import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validateBookingSchema, createCheckoutSchema, updateOrderNotesSchema, refundOrderSchema } from '../utils/validators';

const router = Router();

// Booking routes (authenticated)
router.post(
    '/bookings/validate',
    validate(validateBookingSchema),
    orderController.validateBooking
);

router.post(
    '/checkout/create-session',
    authenticate,
    validate(createCheckoutSchema),
    orderController.createCheckoutSession
);

router.get('/checkout/success', orderController.checkoutSuccess);
router.get('/checkout/cancel', orderController.checkoutCancel);

// User order routes
router.get('/orders', authenticate, orderController.getUserOrders);
router.get('/orders/:id', authenticate, orderController.getUserOrderById);

// Admin order routes
router.get('/admin/orders', authenticate, requireAdmin, orderController.getAllOrders);
router.get('/admin/orders/:id', authenticate, requireAdmin, orderController.getOrderById);

router.patch(
    '/admin/orders/:id/ship',
    authenticate,
    requireAdmin,
    orderController.shipOrder
);

router.patch(
    '/admin/orders/:id/complete',
    authenticate,
    requireAdmin,
    orderController.completeOrder
);

router.post(
    '/admin/orders/:id/refund',
    authenticate,
    requireAdmin,
    validate(refundOrderSchema),
    orderController.refundOrder
);

router.patch(
    '/admin/orders/:id/notes',
    authenticate,
    requireAdmin,
    validate(updateOrderNotesSchema),
    orderController.updateOrderNotes
);

// Admin dashboard routes
router.get('/admin/dashboard/stats', authenticate, requireAdmin, orderController.getDashboardStats);
router.get('/admin/dashboard/recent-orders', authenticate, requireAdmin, orderController.getRecentOrders);

export default router;
