import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { Order, OrderStatus } from '../types';

export class OrderService {
    // Get user orders
    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('orders')
                .select('*, listings (*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new AppError(500, 'Failed to fetch orders');

            return data as Order[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch orders');
        }
    }

    // Get order by ID
    async getOrderById(orderId: string, userId?: string): Promise<Order> {
        try {
            let query = supabaseAdmin
                .from('orders')
                .select('*, listings (*), users (*)')
                .eq('id', orderId);

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query.single();

            if (error || !data) {
                throw new AppError(404, 'Order not found');
            }

            return data as Order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch order');
        }
    }

    // Get all orders (admin)
    async getAllOrders(): Promise<Order[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('orders')
                .select('*, listings (*), users (*)')
                .order('created_at', { ascending: false });

            if (error) throw new AppError(500, 'Failed to fetch orders');

            return data as Order[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch orders');
        }
    }

    // Create order
    async createOrder(data: Partial<Order>): Promise<Order> {
        try {
            const { data: order, error } = await supabaseAdmin
                .from('orders')
                .insert({
                    ...data,
                    status: OrderStatus.PENDING
                })
                .select()
                .single();

            if (error || !order) {
                throw new AppError(500, 'Failed to create order');
            }

            return order as Order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to create order');
        }
    }

    // Update order status (admin)
    async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<Order> {
        try {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString()
            };

            if (trackingNumber) {
                updateData.tracking_number = trackingNumber;
            }

            const { data, error } = await supabaseAdmin
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select()
                .single();

            if (error || !data) {
                throw new AppError(404, 'Order not found');
            }

            return data as Order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to update order');
        }
    }

    // Update order notes (admin)
    async updateOrderNotes(orderId: string, notes: string): Promise<Order> {
        try {
            const { data, error } = await supabaseAdmin
                .from('orders')
                .update({
                    admin_notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error || !data) {
                throw new AppError(404, 'Order not found');
            }

            return data as Order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to update order notes');
        }
    }

    // Get dashboard stats (admin)
    async getDashboardStats() {
        try {
            // Get total revenue
            const { data: revenueData } = await supabaseAdmin
                .from('orders')
                .select('total_amount')
                .in('status', [OrderStatus.COMPLETED, OrderStatus.DELIVERED]);

            const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

            // Get order counts by status
            const { data: orderCounts } = await supabaseAdmin
                .from('orders')
                .select('status');

            const activeOrders = orderCounts?.filter(o =>
                [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(o.status as OrderStatus)
            ).length || 0;

            const pendingOrders = orderCounts?.filter(o => o.status === OrderStatus.PENDING).length || 0;

            // Get total listings
            const { count: totalListings } = await supabaseAdmin
                .from('listings')
                .select('*', { count: 'exact', head: true });

            // Get available listings
            const { count: availableListings } = await supabaseAdmin
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('is_available', true);

            return {
                totalRevenue,
                activeOrders,
                pendingOrders,
                totalListings: totalListings || 0,
                availableListings: availableListings || 0
            };
        } catch (error) {
            throw new AppError(500, 'Failed to fetch dashboard stats');
        }
    }

    // Get recent orders (admin)
    async getRecentOrders(limit: number = 10): Promise<Order[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('orders')
                .select('*, listings (*), users (*)')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw new AppError(500, 'Failed to fetch recent orders');

            return data as Order[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch recent orders');
        }
    }
}

export const orderService = new OrderService();
