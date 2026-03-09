import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
    // POST /api/v1/auth/magic-link
    sendMagicLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        const { token } = await authService.sendMagicLink(email);

        res.status(200).json({
            success: true,
            message: 'Magic link sent successfully',
            email,
            token // For development/testing - remove in production
        });
    });

    // GET /api/v1/auth/callback
    verifyMagicLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.query;

        const { access_token, user } = await authService.verifyMagicLink(token as string);

        res.status(200).json({
            success: true,
            access_token,
            user
        });
    });

    // GET /api/v1/auth/session
    getCurrentSession = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const user = await authService.getCurrentSession(token);

        res.status(200).json({
            success: true,
            user
        });
    });

    // POST /api/v1/auth/logout
    logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.substring(7);

        if (token) {
            await authService.logout(token);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    });
}

export const authController = new AuthController();
