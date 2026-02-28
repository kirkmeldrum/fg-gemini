// ============================================
// Express Application Setup
// ============================================

import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export function createApp(): Application {
    const app = express();

    // ---- Passport ----
    configurePassport();

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
    app.use(passport.initialize());
    app.use(passport.session());

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

    app.get('/', (_req, res) => {
        res.send('🍳 FoodGenie API is running. Use /api for routes or /health for status.');
    });

    // ---- Error Handling ----
    app.use(errorHandler);

    return app;
}
