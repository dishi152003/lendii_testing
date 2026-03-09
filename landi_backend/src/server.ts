import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
app.use(rateLimiter);

// API routes
app.use(`/api/${API_VERSION}`, routes);

// Health check (outside versioned API)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint - API documentation
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Lendii FWP Backend API',
        version: 'v1',
        status: 'operational',
        timestamp: new Date().toISOString(),
        documentation: 'https://github.com/lendii/backend/README.md',
        endpoints: {
            apiBase: `http://localhost:${PORT}/api/${API_VERSION}`,
            health: `http://localhost:${PORT}/health`,
            auth: [
                'POST /auth/magic-link',
                'GET /auth/callback',
                'GET /auth/session',
                'POST /auth/logout'
            ],
            catalog: [
                'GET /listings',
                'GET /listings/:id',
                'GET /listings/:id/availability'
            ],
            admin_listings: [
                'POST /admin/listings',
                'PATCH /admin/listings/:id',
                'POST /admin/listings/:id/publish',
                'POST /admin/listings/:id/unpublish',
                'DELETE /admin/listings/:id'
            ],
            booking: [
                'POST /bookings/validate',
                'POST /checkout/create-session',
                'GET /checkout/success',
                'GET /checkout/cancel'
            ],
            orders: [
                'GET /orders',
                'GET /orders/:id',
                'GET /admin/orders',
                'GET /admin/orders/:id',
                'PATCH /admin/orders/:id/ship',
                'PATCH /admin/orders/:id/complete',
                'POST /admin/orders/:id/refund',
                'PATCH /admin/orders/:id/notes'
            ],
            admin_dashboard: [
                'GET /admin/dashboard/stats',
                'GET /admin/dashboard/recent-orders'
            ],
            payments: [
                'POST /webhooks/stripe',
                'GET /payments/transactions'
            ],
            utilities: [
                'GET /health',
                'GET /meta/enums'
            ]
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        path: req.path
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Lendii FWP Backend Server`);
    console.log(`📍 Running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;
