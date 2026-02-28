// ============================================
// User Repository — Knex queries for users
// and password_reset_tokens tables
// ============================================

import { db } from '../config/database.js';
import type { User } from '@foodgenie/shared';

// ---- Internal DB row types ----

interface UserRow {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    role: string;
    household_id: number | null;
    failed_login_count: number;
    locked_until: Date | null;
    is_active: boolean;
    is_deleted: boolean;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

interface CreateUserData {
    username: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
}

interface UpdateProfileData {
    displayName?: string;
    bio?: string;
    location?: string;
}

interface ResetTokenRow {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
    is_used: boolean;
    used_at: Date | null;
}

// ---- Helpers ----

/** Map a DB row to the shared User type (no password_hash) */
export function toUser(row: UserRow): User {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        location: row.location,
        role: row.role as User['role'],
        householdId: row.household_id,
        isDeleted: Boolean(row.is_deleted),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
    };
}

// ---- Query functions ----

/** Find a user by email, including password_hash (for auth). Returns null if not found or soft-deleted. */
export async function findByEmail(email: string): Promise<UserRow | null> {
    const row = await db('users')
        .where({ email, is_deleted: 0 })
        .first();
    return row ?? null;
}

/** Find a user by id, excluding password_hash. Returns null if not found or soft-deleted. */
export async function findById(id: number): Promise<User | null> {
    const row = await db('users')
        .where({ id, is_deleted: 0 })
        .first<UserRow>();
    return row ? toUser(row) : null;
}

/** Check if an email is already registered */
export async function emailExists(email: string): Promise<boolean> {
    const row = await db('users').where({ email }).first();
    return !!row;
}

/** Check if a username is already taken */
export async function usernameExists(username: string): Promise<boolean> {
    const row = await db('users').where({ username }).first();
    return !!row;
}

/** Create a new user. Returns the new user id. */
export async function create(data: CreateUserData): Promise<number> {
    const rows = await db('users')
        .insert({
            username: data.username,
            email: data.email,
            password_hash: data.passwordHash,
            first_name: data.firstName,
            last_name: data.lastName,
            updated_at: db.fn.now(),
        })
        .returning('id');
    // Knex returns [{id: N}] on MSSQL with .returning()
    return rows[0].id ?? rows[0];
}

/** Update editable profile fields */
export async function updateProfile(id: number, data: UpdateProfileData): Promise<void> {
    const updates: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.displayName !== undefined) updates['display_name'] = data.displayName;
    if (data.bio !== undefined) updates['bio'] = data.bio;
    if (data.location !== undefined) updates['location'] = data.location;
    await db('users').where({ id }).update(updates);
}

/** Update avatar URL */
export async function updateAvatar(id: number, avatarUrl: string): Promise<void> {
    await db('users').where({ id }).update({ avatar_url: avatarUrl, updated_at: db.fn.now() });
}

/** Update bcrypt password hash */
export async function updatePassword(id: number, hash: string): Promise<void> {
    await db('users').where({ id }).update({ password_hash: hash, updated_at: db.fn.now() });
}

/**
 * Increment failed login count.
 * Locks the account (30 minutes) after 5 failed attempts.
 */
export async function incrementFailedLogin(id: number): Promise<void> {
    await db('users').where({ id }).increment('failed_login_count', 1);
    const row = await db('users').where({ id }).select('failed_login_count').first<{ failed_login_count: number }>();
    if (row && row.failed_login_count >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await db('users').where({ id }).update({ locked_until: lockedUntil, updated_at: db.fn.now() });
    }
}

/** Reset failed login count and clear lockout after successful login */
export async function resetFailedLogin(id: number): Promise<void> {
    await db('users').where({ id }).update({
        failed_login_count: 0,
        locked_until: null,
        updated_at: db.fn.now(),
    });
}

/** Soft-delete a user account */
export async function softDelete(id: number): Promise<void> {
    const now = new Date();
    await db('users').where({ id }).update({
        is_deleted: 1,
        deleted_at: now,
        updated_at: now,
    });
}

// ---- Password Reset Tokens ----

/** Store a new (hashed) reset token */
export async function createResetToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date
): Promise<void> {
    await db('password_reset_tokens').insert({
        user_id: userId,
        token: tokenHash,
        expires_at: expiresAt,
        updated_at: db.fn.now(),
    });
}

/** Find a valid (unused, unexpired) token. Compares against the stored hash. */
export async function findValidResetToken(tokenHash: string): Promise<ResetTokenRow | null> {
    const row = await db('password_reset_tokens')
        .where({ token: tokenHash, is_used: 0 })
        .where('expires_at', '>', new Date())
        .first<ResetTokenRow>();
    return row ?? null;
}

/** Mark a token as consumed */
export async function consumeResetToken(id: number): Promise<void> {
    await db('password_reset_tokens').where({ id }).update({
        is_used: 1,
        used_at: new Date(),
        updated_at: db.fn.now(),
    });
}

/** Search users by name or username */
export async function search(query: string, limit = 20): Promise<User[]> {
    const rows = await db('users')
        .where('is_deleted', 0)
        .andWhere(function () {
            this.where('username', 'like', `%${query}%`)
                .orWhere('first_name', 'like', `%${query}%`)
                .orWhere('last_name', 'like', `%${query}%`)
                .orWhere('display_name', 'like', `%${query}%`);
        })
        .limit(limit);
    return rows.map(toUser);
}
