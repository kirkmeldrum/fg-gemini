// ============================================
// Parse Repository
// Log and track recipe extraction attempts
// ============================================

import { db } from '../config/database.js';

export interface ParseLog {
    id: number;
    user_id: number;
    source_url: string | null;
    source_type: 'url' | 'text';
    extraction_method: 'json-ld' | 'ai' | null;
    model_used: string | null;
    tokens_used: number | null;
    estimated_cost: number | null;
    confidence_score: number | null;
    status: 'pending' | 'success' | 'partial' | 'failed';
    result_recipe_id: number | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Create a new parse log entry
 */
export async function createLog(data: Partial<ParseLog>): Promise<number> {
    const [id] = await db('recipe_parse_log').insert({
        ...data,
        status: data.status || 'pending',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
    }).returning('id');
    return id.id || id;
}

/**
 * Update an existing parse log entry
 */
export async function updateLog(id: number, data: Partial<ParseLog>): Promise<void> {
    await db('recipe_parse_log')
        .where({ id })
        .update({
            ...data,
            updated_at: db.fn.now()
        });
}

/**
 * Get user's parse history
 */
export async function getUserHistory(userId: number, limit = 10): Promise<ParseLog[]> {
    return db('recipe_parse_log')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(limit);
}
