import { Request } from 'express';

// User roles
export enum UserRole {
    ADMIN = 'admin',
    BORROWER = 'borrower'
}

// User interface
export interface User {
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

// Listing enums
export enum ListingStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    RENTED = 'rented',
    ARCHIVED = 'archived'
}

export enum ListingCategory {
    DRESSES = 'dresses',
    TOPS = 'tops',
    BOTTOMS = 'bottoms',
    OUTERWEAR = 'outerwear',
    ACCESSORIES = 'accessories',
    SHOES = 'shoes'
}

export enum ListingSize {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL'
}

export enum ListingCondition {
    NEW = 'new',
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair'
}

// Listing interface
export interface Listing {
    id: string;
    title: string;
    description: string;
    category: ListingCategory;
    size: ListingSize;
    brand: string;
    condition: ListingCondition;
    rental_price: number;
    retail_price: number;
    deposit: number;
    images: string[];
    status: ListingStatus;
    is_available: boolean;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

// Order enums
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    RETURNED = 'returned',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

// Order interface
export interface Order {
    id: string;
    user_id: string;
    listing_id: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    deposit_amount: number;
    status: OrderStatus;
    tracking_number?: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

// Payment enums
export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

// Payment interface
export interface Payment {
    id: string;
    order_id: string;
    stripe_session_id: string;
    amount: number;
    status: PaymentStatus;
    created_at: string;
}

// Session interface
export interface Session {
    id: string;
    user_id: string;
    token: string;
    expires_at: string;
    created_at: string;
}

// Magic Link Token interface
export interface MagicLinkToken {
    id: string;
    email: string;
    token: string;
    expires_at: string;
    created_at: string;
}

// Extended Express Request with authenticated user
export interface AuthRequest extends Request {
    user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
