// ============================================
// Auth Middleware (Sprint 1.1)
// ============================================

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            username: string;
            role: 'user' | 'admin';
        }
    }
}

/**
 * Require authentication — returns 401 if no session
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next(new UnauthorizedError());
    }
    next();
}

/**
 * Require a specific role — returns 403 if insufficient
 */
export function requireRole(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError());
        }
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError());
        }
        next();
    };
}

// TODO: Sprint 1.1 — Passport.js local strategy configuration
// export function configurePassport() { ... }
