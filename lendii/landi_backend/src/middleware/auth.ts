import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { AppError } from './errorHandler';
import { supabaseAdmin } from '../config/supabase';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'Unauthorized - No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify session token in database
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('sessions')
            .select('*, users (*)')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (sessionError || !session) {
            throw new AppError(401, 'Unauthorized - Invalid or expired token');
        }

        // Attach user to request
        req.user = session.users;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(401, 'Unauthorized'));
        }
    }
};

export const requireAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return next(new AppError(401, 'Unauthorized - Authentication required'));
    }

    if (req.user.role !== UserRole.ADMIN) {
        return next(new AppError(403, 'Forbidden - Admin access required'));
    }

    next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without user
        }

        const token = authHeader.substring(7);

        const { data: session } = await supabaseAdmin
            .from('sessions')
            .select('*, users (*)')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (session) {
            req.user = session.users;
        }

        next();
    } catch (error) {
        next(); // Continue even if auth fails
    }
};
