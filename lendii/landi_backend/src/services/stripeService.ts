import { stripe, stripeConfig } from '../config/stripe';
import { AppError } from '../middleware/errorHandler';
import { supabaseAdmin } from '../config/supabase';
import { OrderStatus, PaymentStatus } from '../types';
import { orderService } from './orderService';
import Stripe from 'stripe';

export class StripeService {
    // Create checkout session
    async createCheckoutSession(
        userId: string,
        listingId: string,
        startDate: string,
        endDate: string
    ): Promise<{ session_id: string; url: string }> {
        try {
            // Get listing details
            const { data: listing, error: listingError } = await supabaseAdmin
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .single();

            if (listingError || !listing) {
                throw new AppError(404, 'Listing not found');
            }

            // Get user details
            const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                throw new AppError(404, 'User not found');
            }

            // Calculate dates and pricing
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const totalAmount = listing.rental_price * days;
            const depositAmount = listing.deposit;

            // Create order first
            const order = await orderService.createOrder({
                user_id: userId,
                listing_id: listingId,
                start_date: startDate,
                end_date: endDate,
                total_amount: totalAmount,
                deposit_amount: depositAmount,
                status: OrderStatus.PENDING
            });

            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                customer_email: user.email,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: listing.title,
                                description: `Rental period: ${days} days`,
                                images: listing.images.slice(0, 1)
                            },
                            unit_amount: Math.round(totalAmount * 100) // Stripe expects cents
                        },
                        quantity: 1
                    },
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Security Deposit',
                                description: 'Refundable security deposit'
                            },
                            unit_amount: Math.round(depositAmount * 100)
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`,
                metadata: {
                    order_id: order.id,
                    listing_id: listingId,
                    user_id: userId
                }
            });

            // Save payment record
            await supabaseAdmin
                .from('payments')
                .insert({
                    order_id: order.id,
                    stripe_session_id: session.id,
                    amount: totalAmount + depositAmount,
                    status: PaymentStatus.PENDING
                });

            return {
                session_id: session.id,
                url: session.url || ''
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Create checkout session error:', error);
            throw new AppError(500, 'Failed to create checkout session');
        }
    }

    // Handle Stripe webhook
    async handleWebhook(payload: string, signature: string): Promise<void> {
        try {
            if (!stripeConfig.webhookSecret) {
                throw new AppError(500, 'Webhook secret not configured');
            }

            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                stripeConfig.webhookSecret
            );

            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                    break;

                case 'payment_intent.succeeded':
                    console.log('Payment succeeded:', event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Webhook error:', error);
            throw new AppError(400, 'Webhook processing failed');
        }
    }

    // Handle successful checkout
    private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        const orderId = session.metadata?.order_id;

        if (!orderId) {
            console.error('No order_id in session metadata');
            return;
        }

        // Update payment status
        await supabaseAdmin
            .from('payments')
            .update({ status: PaymentStatus.COMPLETED })
            .eq('stripe_session_id', session.id);

        // Update order status
        await orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
    }

    // Handle failed payment
    private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        // Update payment status
        await supabaseAdmin
            .from('payments')
            .update({ status: PaymentStatus.FAILED })
            .eq('stripe_session_id', paymentIntent.id);
    }

    // Refund order
    async refundOrder(orderId: string, amount?: number): Promise<void> {
        try {
            // Get payment details
            const { data: payment, error } = await supabaseAdmin
                .from('payments')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (error || !payment) {
                throw new AppError(404, 'Payment not found');
            }

            // Get checkout session to find payment intent
            const session = await stripe.checkout.sessions.retrieve(payment.stripe_session_id);

            if (!session.payment_intent) {
                throw new AppError(400, 'No payment intent found');
            }

            // Create refund
            await stripe.refunds.create({
                payment_intent: session.payment_intent as string,
                amount: amount ? Math.round(amount * 100) : undefined // Stripe expects cents
            });

            // Update payment status
            await supabaseAdmin
                .from('payments')
                .update({ status: PaymentStatus.REFUNDED })
                .eq('id', payment.id);

            // Update order status
            await orderService.updateOrderStatus(orderId, OrderStatus.REFUNDED);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Refund error:', error);
            throw new AppError(500, 'Failed to process refund');
        }
    }

    // Get payment transactions
    async getTransactions(userId: string): Promise<any[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('payments')
                .select('*, orders (*, listings (*))')
                .eq('orders.user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new AppError(500, 'Failed to fetch transactions');

            return data || [];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch transactions');
        }
    }
}

export const stripeService = new StripeService();
