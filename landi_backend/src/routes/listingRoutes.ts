import { Router } from 'express';
import { listingController } from '../controllers/listingController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { createListingSchema, updateListingSchema } from '../utils/validators';

const router = Router();

// Public routes - mounted at /api/v1/listings
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);
router.get('/:id/availability', listingController.checkAvailability);

export default router;
