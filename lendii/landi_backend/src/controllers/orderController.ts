import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { orderService } from '../services/orderService';
import { stripeService } from '../services/stripeService';
import { listingService } from '../services/listingService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { OrderStatus } from '../types';

export class OrderController {
    // POST /api/v1/bookings/validate
    validateBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { listing_id, start_date, end_date } = req.body;

        const availability = await listingService.checkAvailability(listing_id, start_date, end_date);

        if (!availability.available) {
            throw new AppError(400, 'Listing is not available for the selected dates');
        }

        res.status(200).json({
            success: true,
            data: {
                valid: true,
                ...availability
            },
            message: 'Booking dates are valid'
        });
    });

    // POST /api/v1/checkout/create-session
    createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { listing_id, start_date, end_date } = req.body;

        const session = await stripeService.createCheckoutSession(
            req.user!.id,
            listing_id,
            start_date,
            end_date
        );

        res.status(200).json({
            success: true,
            data: session
        });
    });

    // GET /api/v1/checkout/success
    checkoutSuccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { session_id } = req.query;

        res.status(200).json({
            success: true,
            message: 'Payment successful',
            session_id
        });
    });

    // GET /api/v1/checkout/cancel
    checkoutCancel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({
            success: true,
            message: 'Checkout cancelled'
        });
    });

    // GET /api/v1/orders
    getUserOrders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const orders = await orderService.getUserOrders(req.user!.id);

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length
        });
    });

    // GET /api/v1/orders/:id
    getUserOrderById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const order = await orderService.getOrderById(id, req.user!.id);

        res.status(200).json({
            success: true,
            data: order
        });
    });

    // GET /api/v1/admin/orders
    getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const orders = await orderService.getAllOrders();

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length
        });
    });

    // GET /api/v1/admin/orders/:id
    getOrderById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const order = await orderService.getOrderById(id);

        res.status(200).json({
            success: true,
            data: order
        });
    });

    // PATCH /api/v1/admin/orders/:id/ship
    shipOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { tracking_number } = req.body;

        const order = await orderService.updateOrderStatus(id, OrderStatus.SHIPPED, tracking_number);

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order marked as shipped'
        });
    });

    // PATCH /api/v1/admin/orders/:id/complete
    completeOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const order = await orderService.updateOrderStatus(id, OrderStatus.COMPLETED);

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order completed successfully'
        });
    });

    // POST /api/v1/admin/orders/:id/refund
    refundOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { amount } = req.body;

        await stripeService.refundOrder(id, amount);

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully'
        });
    });

    // PATCH /api/v1/admin/orders/:id/notes
    updateOrderNotes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { notes } = req.body;

        const order = await orderService.updateOrderNotes(id, notes);

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order notes updated successfully'
        });
    });

    // GET /api/v1/admin/dashboard/stats
    getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const stats = await orderService.getDashboardStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    });

    // GET /api/v1/admin/dashboard/recent-orders
    getRecentOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { limit = '10' } = req.query;

        const orders = await orderService.getRecentOrders(parseInt(limit as string));

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length
        });
    });
}

export const orderController = new OrderController();
