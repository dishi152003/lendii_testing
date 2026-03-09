# Lendii FWP Backend - Copilot Instructions

## Project Overview
Production-ready backend for Lendii Fashion Rental Platform using Next.js 14, TypeScript, Supabase, and Stripe.

## Tech Stack
- Next.js 14 with App Router
- TypeScript (strict mode)
- Supabase (PostgreSQL + Auth)
- Stripe for payments
- Resend for emails
- Prisma ORM

## Development Progress

- [x] Create .github/copilot-instructions.md file
- [ ] Scaffold Next.js 14 backend project
- [ ] Setup Supabase and database schema
- [ ] Implement all 30 API endpoints
- [ ] Configure authentication and middleware
- [ ] Setup Stripe integration
- [ ] Install dependencies and compile
- [ ] Test and launch backend server

## API Endpoints (30 total)
All endpoints follow `/api/v1/*` pattern

### Authentication (4)
- POST /auth/magic-link
- GET /auth/callback
- GET /auth/session
- POST /auth/logout

### Catalog (3)
- GET /listings
- GET /listings/:id
- GET /listings/:id/availability

### Admin Listings (5)
- POST /admin/listings
- PATCH /admin/listings/:id
- POST /admin/listings/:id/publish
- POST /admin/listings/:id/unpublish
- DELETE /admin/listings/:id

### Booking & Checkout (4)
- POST /bookings/validate
- POST /checkout/create-session
- GET /checkout/success
- GET /checkout/cancel

### Payments (2)
- POST /webhooks/stripe
- GET /payments/transactions

### Orders (8)
- GET /orders
- GET /orders/:id
- GET /admin/orders
- GET /admin/orders/:id
- PATCH /admin/orders/:id/ship
- PATCH /admin/orders/:id/complete
- POST /admin/orders/:id/refund
- PATCH /admin/orders/:id/notes

### Admin Dashboard (2)
- GET /admin/dashboard/stats
- GET /admin/dashboard/recent-orders

### Utilities (2)
- GET /health
- GET /meta/enums

## Database Schema
- users (id, email, role, created_at, updated_at)
- listings (id, title, description, category, size, brand, condition, rental_price, retail_price, deposit, images, status, is_available, owner_id, created_at, updated_at)
- orders (id, user_id, listing_id, start_date, end_date, total_amount, deposit_amount, status, tracking_number, admin_notes, created_at, updated_at)
- sessions (id, user_id, token, expires_at, created_at)
- payments (id, order_id, stripe_session_id, amount, status, created_at)
- magic_link_tokens (id, email, token, expires_at, created_at)

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- DATABASE_URL

## Development Guidelines
- Use TypeScript strict mode
- Follow Next.js 14 App Router conventions
- All API routes in app/api/v1/
- Use middleware for auth and CORS
- Implement proper error handling
- Add request validation
- Use environment variables for secrets
- Follow RESTful API design
