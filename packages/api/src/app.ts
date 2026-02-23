// ============================================
// Express Application Setup
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export function createApp() {
    const app = express();

    // ---- Security ----
    app.use(helmet());
    app.use(cors({
        origin: process.env.WEB_URL || 'http://localhost:5173',
        credentials: true,
    }));

    // ---- Parsing ----
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // ---- Logging ----
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));
    }

    // ---- Sessions ----
    app.use(session({
        secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24h
            sameSite: 'lax',
        },
        // TODO: Add Redis store for production
    }));

    // ---- Auth ----
    // TODO: Configure Passport.js in Sprint 1.1
    // configurePassport();
    // app.use(passport.initialize());
    // app.use(passport.session());

    // ---- Routes ----
    app.use('/api', apiRoutes);

    // ---- Health Check ----
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        });
    });

    // ---- Error Handling ----
    app.use(errorHandler);

    return app;
}
