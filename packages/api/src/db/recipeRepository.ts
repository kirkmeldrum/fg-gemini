// ============================================
// Recipe Repository
// Knex queries for recipes, ingredients, and steps
// ============================================

import { db } from '../config/database.js';
import { transformRecipeImages } from '../utils/imageUtils.js';

/**
 * Find recipes with filtering and pagination
 */
export async function find(params: {
    query?: string;
    cuisine?: string;
    limit?: number;
    offset?: number;
    userId?: number;
    visibility?: 'all' | 'public' | 'private';
    is_gold_standard?: boolean;
}) {
    const { query, cuisine, limit = 20, offset = 0, userId, visibility = 'public', is_gold_standard } = params;

    const q = db('recipes').where('is_deleted', false);

    if (is_gold_standard !== undefined) {
        q.where('is_gold_standard', is_gold_standard);
    }

    if (visibility === 'public') {
        q.where('privacy', 'public');
    } else if (visibility === 'private' && userId) {
        q.where({ privacy: 'private', author_id: userId });
    } else if (visibility === 'all' && userId) {
        q.where(function () {
            this.where('privacy', 'public').orWhere('author_id', userId);
        });
    } else {
        q.where('privacy', 'public');
    }

    if (query) {
        q.andWhere((builder) => {
            builder.where('title', 'like', `%${query}%`)
                .orWhere('description', 'like', `%${query}%`);
        });
    }

    if (cuisine) {
        q.andWhere({ cuisine });
    }

    const [count] = await q.clone().count<{ count: number }[]>('* as count');
    const items = await q.limit(limit).offset(offset)
        .orderBy('is_gold_standard', 'desc')
        .orderBy('created_at', 'desc');

    return {
        items: transformRecipeImages(items),
        total: count.count,
        limit,
        offset,
    };
}

/**
 * Find a recipe by its unique slug
 */
export async function findBySlug(slug: string) {
    const recipe = await db('recipes')
        .where({ slug, is_deleted: false })
        .first();

    if (!recipe) return null;

    const ingredients = await db('recipe_ingredients as ri')
        .leftJoin('ingredients as i', 'ri.ingredient_id', 'i.id')
        .where({ 'ri.recipe_id': recipe.id })
        .select(
            'ri.*',
            'i.name as ingredient_name',
            'i.brand_name',
            'i.ingredient_type'
        )
        .orderBy('ri.sort_order', 'asc');

    const steps = await db('recipe_steps')
        .where({ recipe_id: recipe.id })
        .orderBy('step_number', 'asc');

    return {
        ...transformRecipeImages([recipe])[0],
        ingredients,
        steps,
    };
}

/**
 * Find a recipe by ID
 */
export async function findById(id: number) {
    const recipe = await db('recipes')
        .where({ id, is_deleted: false })
        .first();

    if (!recipe) return null;

    const ingredients = await db('recipe_ingredients as ri')
        .leftJoin('ingredients as i', 'ri.ingredient_id', 'i.id')
        .where({ 'ri.recipe_id': id })
        .select(
            'ri.*',
            'i.name as ingredient_name',
            'i.brand_name',
            'i.ingredient_type'
        )
        .orderBy('ri.sort_order', 'asc');

    const steps = await db('recipe_steps')
        .where({ recipe_id: id })
        .orderBy('step_number', 'asc');

    return {
        ...transformRecipeImages([recipe])[0],
        ingredients,
        steps,
    };
}

/**
 * Create a new recipe with its ingredients and steps
 */
export async function create(data: any, ingredients: any[], steps: any[]) {
    return db.transaction(async (trx) => {
        const [recipeId] = await trx('recipes').insert(data).returning('id');
        const id = recipeId.id || recipeId;

        if (ingredients.length > 0) {
            await trx('recipe_ingredients').insert(
                ingredients.map((ing, idx) => ({ ...ing, recipe_id: id, sort_order: idx + 1 }))
            );
        }

        if (steps.length > 0) {
            await trx('recipe_steps').insert(
                steps.map((step, idx) => ({ ...step, recipe_id: id, step_number: idx + 1 }))
            );
        }

        return id;
    });
}

/**
 * Update recipe privacy
 */
export async function updatePrivacy(id: number, privacy: 'public' | 'private' | 'friends') {
    return db('recipes')
        .where({ id })
        .update({ privacy, updated_at: db.fn.now() });
}

/**
 * Soft delete a recipe
 */
export async function softDelete(id: number) {
    return db('recipes')
        .where({ id })
        .update({ is_deleted: true, updated_at: db.fn.now() });
}
