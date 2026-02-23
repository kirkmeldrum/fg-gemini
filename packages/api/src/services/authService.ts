// ============================================
// Auth Service
// bcrypt, token generation, session helpers
// ============================================

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 12;

/** Hash a plain-text password with bcrypt */
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Verify a plain-text password against a bcrypt hash */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

/**
 * Generate a secure password reset token.
 * Returns the raw token (sent in the email link) and its SHA-256 hash (stored in DB).
 * Only the hash is ever persisted — the raw value lives only in the user's email.
 */
export function generateResetToken(): { raw: string; hashed: string } {
    const raw = crypto.randomBytes(32).toString('hex'); // 64-char hex string
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hashed };
}

/** Hash a raw token for DB lookup (same algorithm as above) */
export function hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Calculate the expiry time for a reset token.
 * Returns a Date 1 hour from now.
 */
export function resetTokenExpiry(): Date {
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

/**
 * Check whether a user's account is locked out.
 * locked_until is set by userRepository.incrementFailedLogin after 5 failures.
 */
export function isAccountLocked(lockedUntil: Date | null): boolean {
    if (!lockedUntil) return false;
    return new Date(lockedUntil) > new Date();
}

/** Minutes remaining on a lockout (rounded up) */
export function lockoutMinutesRemaining(lockedUntil: Date | null): number {
    if (!lockedUntil) return 0;
    const ms = new Date(lockedUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 60000));
}
