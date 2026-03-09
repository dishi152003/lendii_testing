import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { listingService } from '../services/listingService';
import { asyncHandler } from '../middleware/errorHandler';

export class ListingController {
    // GET /api/v1/listings
    getAllListings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const listings = await listingService.getAllListings();

        res.status(200).json({
            success: true,
            data: listings,
            count: listings.length
        });
    });

    // GET /api/v1/listings/:id
    getListingById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const listing = await listingService.getListingById(id);

        res.status(200).json({
            success: true,
            data: listing
        });
    });

    // GET /api/v1/listings/:id/availability
    checkAvailability = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { start_date, end_date } = req.query;

        const availability = await listingService.checkAvailability(
            id,
            start_date as string,
            end_date as string
        );

        res.status(200).json({
            success: true,
            data: availability
        });
    });

    // POST /api/v1/admin/listings
    createListing = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const listing = await listingService.createListing(req.user!.id, req.body);

        res.status(201).json({
            success: true,
            data: listing,
            message: 'Listing created successfully'
        });
    });

    // PATCH /api/v1/admin/listings/:id
    updateListing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const listing = await listingService.updateListing(id, req.body);

        res.status(200).json({
            success: true,
            data: listing,
            message: 'Listing updated successfully'
        });
    });

    // POST /api/v1/admin/listings/:id/publish
    publishListing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const listing = await listingService.publishListing(id);

        res.status(200).json({
            success: true,
            data: listing,
            message: 'Listing published successfully'
        });
    });

    // POST /api/v1/admin/listings/:id/unpublish
    unpublishListing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const listing = await listingService.unpublishListing(id);

        res.status(200).json({
            success: true,
            data: listing,
            message: 'Listing unpublished successfully'
        });
    });

    // DELETE /api/v1/admin/listings/:id
    deleteListing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        await listingService.deleteListing(id);

        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });
    });
}

export const listingController = new ListingController();
