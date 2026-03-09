import { Router } from 'express';
import { listingController } from '../controllers/listingController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { createListingSchema, updateListingSchema } from '../utils/validators';

const router = Router();

// All routes require admin authentication
// Mounted at /api/v1/admin/listings

router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createListingSchema),
    listingController.createListing
);

router.patch(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateListingSchema),
    listingController.updateListing
);

router.post(
    '/:id/publish',
    authenticate,
    requireAdmin,
    listingController.publishListing
);

router.post(
    '/:id/unpublish',
    authenticate,
    requireAdmin,
    listingController.unpublishListing
);

router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    listingController.deleteListing
);

export default router;
