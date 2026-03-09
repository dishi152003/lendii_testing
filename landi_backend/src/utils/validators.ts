import { z } from 'zod';

// Auth schemas
export const magicLinkSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address')
    })
});

export const authCallbackSchema = z.object({
    query: z.object({
        token: z.string().min(1, 'Token is required')
    })
});

// Listing schemas
export const createListingSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        category: z.enum(['dresses', 'tops', 'bottoms', 'outerwear', 'accessories', 'shoes']),
        size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        brand: z.string().min(1, 'Brand is required'),
        condition: z.enum(['new', 'excellent', 'good', 'fair']),
        rental_price: z.number().positive('Rental price must be positive'),
        retail_price: z.number().positive('Retail price must be positive'),
        deposit: z.number().min(0, 'Deposit cannot be negative'),
        images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required')
    })
});

export const updateListingSchema = z.object({
    body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        category: z.enum(['dresses', 'tops', 'bottoms', 'outerwear', 'accessories', 'shoes']).optional(),
        size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).optional(),
        brand: z.string().min(1).optional(),
        condition: z.enum(['new', 'excellent', 'good', 'fair']).optional(),
        rental_price: z.number().positive().optional(),
        retail_price: z.number().positive().optional(),
        deposit: z.number().min(0).optional(),
        images: z.array(z.string().url()).optional()
    })
});

// Booking schemas
export const validateBookingSchema = z.object({
    body: z.object({
        listing_id: z.string().min(1, 'Listing ID is required'),
        start_date: z.string().datetime('Invalid start date'),
        end_date: z.string().datetime('Invalid end date')
    })
});

export const createCheckoutSchema = z.object({
    body: z.object({
        listing_id: z.string().min(1, 'Listing ID is required'),
        start_date: z.string().datetime('Invalid start date'),
        end_date: z.string().datetime('Invalid end date')
    })
});

// Order schemas
export const updateOrderNotesSchema = z.object({
    body: z.object({
        notes: z.string().min(1, 'Notes cannot be empty')
    })
});

export const refundOrderSchema = z.object({
    body: z.object({
        reason: z.string().optional(),
        amount: z.number().positive().optional()
    })
});
