// ============================================
// Preferences Repository
// Knex queries for user_dietary_preferences
// ============================================

import { db } from '../config/database.js';
import type { DietaryPreferences } from '@foodgenie/shared';

interface PreferenceRow {
    id: number;
    user_id: number;
    preference_type: 'diet' | 'allergen' | 'blacklist';
    value: string | null;
    ingredient_id: number | null;
}

/** Fetch all dietary preferences for a user, shaped into the DietaryPreferences object */
export async function getByUserId(userId: number): Promise<DietaryPreferences> {
    const rows = await db('user_dietary_preferences')
        .where({ user_id: userId })
        .select<PreferenceRow[]>('id', 'user_id', 'preference_type', 'value', 'ingredient_id');

    const diets: string[] = [];
    const allergens: string[] = [];
    const blacklistedIngredients: number[] = [];

    for (const row of rows) {
        if (row.preference_type === 'diet' && row.value) {
            diets.push(row.value);
        } else if (row.preference_type === 'allergen' && row.value) {
            allergens.push(row.value);
        } else if (row.preference_type === 'blacklist' && row.ingredient_id !== null) {
            blacklistedIngredients.push(row.ingredient_id);
        }
    }

    return { diets, allergens, blacklistedIngredients };
}

/**
 * Replace all preferences for a user atomically.
 * Deletes existing diet/allergen/blacklist rows then re-inserts.
 */
export async function replaceAll(userId: number, prefs: DietaryPreferences): Promise<void> {
    await db.transaction(async (trx) => {
        await trx('user_dietary_preferences')
            .where({ user_id: userId })
            .whereIn('preference_type', ['diet', 'allergen', 'blacklist'])
            .delete();

        const rows: Array<{
            user_id: number;
            preference_type: string;
            value: string | null;
            ingredient_id: number | null;
            updated_at: ReturnType<typeof db.fn.now>;
        }> = [];

        for (const diet of prefs.diets) {
            rows.push({ user_id: userId, preference_type: 'diet', value: diet, ingredient_id: null, updated_at: db.fn.now() });
        }
        for (const allergen of prefs.allergens) {
            rows.push({ user_id: userId, preference_type: 'allergen', value: allergen, ingredient_id: null, updated_at: db.fn.now() });
        }
        for (const ingredientId of prefs.blacklistedIngredients) {
            rows.push({ user_id: userId, preference_type: 'blacklist', value: null, ingredient_id: ingredientId, updated_at: db.fn.now() });
        }

        if (rows.length > 0) {
            await trx('user_dietary_preferences').insert(rows);
        }
    });
}
