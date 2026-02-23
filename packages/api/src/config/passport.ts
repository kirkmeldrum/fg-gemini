// ============================================
// Passport.js Configuration
// Local strategy + serialize/deserialize
// ============================================

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import * as userRepo from '../db/userRepository.js';
import { verifyPassword, isAccountLocked, lockoutMinutesRemaining } from '../services/authService.js';

export function configurePassport(): void {

    // ---- Local Strategy ----
    // Email + password login. Called by POST /api/auth/login.

    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await userRepo.findByEmail(email);

                // Use a constant-time "wrong credentials" path for enumeration safety
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Check account lock before password verification
                if (isAccountLocked(user.locked_until)) {
                    const mins = lockoutMinutesRemaining(user.locked_until);
                    return done(null, false, {
                        message: `Too many attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
                    });
                }

                const valid = await verifyPassword(password, user.password_hash);
                if (!valid) {
                    // Increment failed count — may trigger lock
                    await userRepo.incrementFailedLogin(user.id);
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Success — reset counters and return sanitized user
                await userRepo.resetFailedLogin(user.id);
                return done(null, userRepo.toUser(user));

            } catch (err) {
                return done(err);
            }
        }
    ));

    // ---- Session Serialization ----
    // Store only the user id in the session cookie

    passport.serializeUser((user, done) => {
        done(null, (user as Express.User).id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await userRepo.findById(id);
            if (!user) return done(null, false);
            done(null, user as Express.User);
        } catch (err) {
            done(err);
        }
    });
}
