// ============================================
// Auth Routes
// POST   /api/auth/register
// POST   /api/auth/login
// POST   /api/auth/logout
// GET    /api/auth/me
// PATCH  /api/auth/me
// POST   /api/auth/me/avatar
// PATCH  /api/auth/password
// POST   /api/auth/forgot-password
// POST   /api/auth/reset-password
// DELETE /api/auth/me
// GET    /api/auth/preferences
// PUT    /api/auth/preferences
// ============================================

import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import path from 'path';
import fs from 'fs/promises';
import 'multer'; // side-effect import — augments Express Request with req.file
import { registerSchema, updateProfileSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, dietaryPreferencesSchema } from '@foodgenie/shared';
import * as userRepo from '../db/userRepository.js';
import * as prefsRepo from '../db/preferencesRepository.js';
import { hashPassword, verifyPassword, generateResetToken, hashToken, resetTokenExpiry } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { avatarUpload } from '../config/multer.js';
import { ConflictError, AppError } from '../middleware/errorHandler.js';

const router: IRouter = Router();

// ============================================
// POST /register
// ============================================

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = registerSchema.parse(req.body);

        // Duplicate checks
        if (await userRepo.emailExists(data.email)) {
            throw new ConflictError('An account with this email already exists');
        }
        if (await userRepo.usernameExists(data.username)) {
            throw new ConflictError('This username is taken');
        }

        const passwordHash = await hashPassword(data.password);
        const userId = await userRepo.create({
            username: data.username,
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        const user = await userRepo.findById(userId);

        // Establish session
        await new Promise<void>((resolve, reject) => {
            req.login(user as Express.User, (err) => (err ? reject(err) : resolve()));
        });

        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /login
// ============================================

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
        if (err) return next(err);

        if (!user) {
            const message = info?.message ?? 'Invalid email or password';
            // Detect lockout message vs. wrong credentials
            const status = message.startsWith('Too many') ? 429 : 401;
            return res.status(status).json({
                success: false,
                error: { code: status === 429 ? 'RATE_LIMITED' : 'UNAUTHORIZED', message },
            });
        }

        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            res.json({ success: true, data: user });
        });
    })(req, res, next);
});

// ============================================
// POST /logout
// ============================================

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({ success: true, data: null });
        });
    });
});

// ============================================
// GET /me
// ============================================

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user is populated by Passport.deserializeUser on every request
        const user = await userRepo.findById(req.user!.id);
        if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// ============================================
// PATCH /me  — update profile
// ============================================

router.patch('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = updateProfileSchema.parse(req.body);
        await userRepo.updateProfile(req.user!.id, data);
        const user = await userRepo.findById(req.user!.id);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /me/avatar  — upload profile avatar
// ============================================

// Upload directory — served as static in server.ts
const AVATAR_DIR = path.resolve('public', 'uploads', 'avatars');

router.post(
    '/me/avatar',
    requireAuth,
    avatarUpload.single('avatar'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                throw new AppError(400, 'NO_FILE', 'No file uploaded');
            }

            // Ensure directory exists
            await fs.mkdir(AVATAR_DIR, { recursive: true });

            // Write file — use userId as filename to auto-replace old avatar
            const ext = req.file.mimetype === 'image/png' ? 'png'
                : req.file.mimetype === 'image/webp' ? 'webp'
                    : 'jpg';
            const filename = `${req.user!.id}.${ext}`;
            const filePath = path.join(AVATAR_DIR, filename);
            await fs.writeFile(filePath, req.file.buffer);

            const avatarUrl = `/uploads/avatars/${filename}`;
            await userRepo.updateAvatar(req.user!.id, avatarUrl);

            const user = await userRepo.findById(req.user!.id);
            res.json({ success: true, data: user });
        } catch (err) {
            next(err);
        }
    }
);

// ============================================
// PATCH /password  — change password
// ============================================

router.patch('/password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

        // Need password_hash — re-fetch full row
        const userRow = await userRepo.findByEmail(req.user!.email);
        if (!userRow) throw new AppError(404, 'NOT_FOUND', 'User not found');

        const valid = await verifyPassword(currentPassword, userRow.password_hash);
        if (!valid) {
            throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect');
        }

        const newHash = await hashPassword(newPassword);
        await userRepo.updatePassword(req.user!.id, newHash);

        res.json({ success: true, data: null });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /forgot-password
// ============================================

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        // Always return 200 — prevents email enumeration
        const SAFE_RESPONSE = {
            success: true,
            data: { message: "If an account exists with this email, a reset link has been sent." },
        };

        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res.json(SAFE_RESPONSE);
        }

        const { raw, hashed } = generateResetToken();
        const expiresAt = resetTokenExpiry();
        await userRepo.createResetToken(user.id, hashed, expiresAt);

        // TODO: replace with email provider (Resend / SendGrid / Nodemailer)
        const resetLink = `${process.env.WEB_URL || 'http://localhost:5174'}/reset-password?token=${raw}`;
        console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);

        // In dev, surface the link in the response so it can be retrieved without console access.
        // This field is intentionally absent in production.
        const devData = process.env.NODE_ENV === 'development' ? { resetLink } : {};

        return res.json({
            success: true,
            data: {
                message: "If an account exists with this email, a reset link has been sent.",
                ...devData,
            },
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /reset-password
// ============================================

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token: rawToken, newPassword } = resetPasswordSchema.parse(req.body);

        const tokenHash = hashToken(rawToken);
        const tokenRow = await userRepo.findValidResetToken(tokenHash);

        if (!tokenRow) {
            throw new AppError(400, 'TOKEN_INVALID', 'Reset link is invalid or has expired');
        }

        const newHash = await hashPassword(newPassword);
        await userRepo.updatePassword(tokenRow.user_id, newHash);
        await userRepo.consumeResetToken(tokenRow.id);

        res.json({ success: true, data: { message: 'Password reset. Please log in.' } });
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /me  — soft-delete account
// ============================================

router.delete('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        await userRepo.softDelete(userId);

        req.logout((err) => {
            if (err) return next(err);
            req.session.destroy(() => {
                res.clearCookie('connect.sid');
                res.json({ success: true, data: null });
            });
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /preferences
// ============================================

router.get('/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const prefs = await prefsRepo.getByUserId(req.user!.id);
        res.json({ success: true, data: prefs });
    } catch (err) {
        next(err);
    }
});

// ============================================
// PUT /preferences
// ============================================

router.put('/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const prefs = dietaryPreferencesSchema.parse(req.body);
        await prefsRepo.replaceAll(req.user!.id, prefs);
        res.json({ success: true, data: prefs });
    } catch (err) {
        next(err);
    }
});

export default router;
