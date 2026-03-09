import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middleware/validator';
import { magicLinkSchema, authCallbackSchema } from '../utils/validators';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/v1/auth/magic-link
router.post(
    '/magic-link',
    authRateLimiter,
    validate(magicLinkSchema),
    authController.sendMagicLink
);

// GET /api/v1/auth/callback
router.get(
    '/callback',
    validate(authCallbackSchema),
    authController.verifyMagicLink
);

// GET /api/v1/auth/session
router.get('/session', authController.getCurrentSession);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

export default router;
