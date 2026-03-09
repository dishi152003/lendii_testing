import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { Listing, ListingStatus } from '../types';

export class ListingService {
    // Get all published listings
    async getAllListings(): Promise<Listing[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('listings')
                .select('*')
                .eq('status', ListingStatus.PUBLISHED)
                .order('created_at', { ascending: false });

            if (error) throw new AppError(500, 'Failed to fetch listings');

            return data as Listing[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch listings');
        }
    }

    // Get listing by ID
    async getListingById(id: string): Promise<Listing> {
        try {
            const { data, error } = await supabaseAdmin
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                throw new AppError(404, 'Listing not found');
            }

            return data as Listing;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch listing');
        }
    }

    // Check listing availability
    async checkAvailability(
        listingId: string,
        startDate: string,
        endDate: string
    ): Promise<{ available: boolean; listing_id: string; start_date: string; end_date: string }> {
        try {
            const listing = await this.getListingById(listingId);

            if (!listing.is_available) {
                return { available: false, listing_id: listingId, start_date: startDate, end_date: endDate };
            }

            // Check for overlapping bookings
            const { data: overlappingOrders } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('listing_id', listingId)
                .in('status', ['confirmed', 'shipped', 'delivered'])
                .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

            const available = !overlappingOrders || overlappingOrders.length === 0;

            return { available, listing_id: listingId, start_date: startDate, end_date: endDate };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to check availability');
        }
    }

    // Create listing (admin)
    async createListing(userId: string, data: Partial<Listing>): Promise<Listing> {
        try {
            const { data: listing, error } = await supabaseAdmin
                .from('listings')
                .insert({
                    ...data,
                    owner_id: userId,
                    status: ListingStatus.DRAFT,
                    is_available: false
                })
                .select()
                .single();

            if (error || !listing) {
                throw new AppError(500, 'Failed to create listing');
            }

            return listing as Listing;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to create listing');
        }
    }

    // Update listing (admin)
    async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
        try {
            const { data: listing, error } = await supabaseAdmin
                .from('listings')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error || !listing) {
                throw new AppError(404, 'Listing not found');
            }

            return listing as Listing;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to update listing');
        }
    }

    // Publish listing (admin)
    async publishListing(id: string): Promise<Listing> {
        return this.updateListing(id, {
            status: ListingStatus.PUBLISHED,
            is_available: true
        });
    }

    // Unpublish listing (admin)
    async unpublishListing(id: string): Promise<Listing> {
        return this.updateListing(id, {
            status: ListingStatus.DRAFT,
            is_available: false
        });
    }

    // Delete listing (admin)
    async deleteListing(id: string): Promise<void> {
        try {
            const { error } = await supabaseAdmin
                .from('listings')
                .delete()
                .eq('id', id);

            if (error) {
                throw new AppError(404, 'Listing not found');
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to delete listing');
        }
    }
}

export const listingService = new ListingService();
