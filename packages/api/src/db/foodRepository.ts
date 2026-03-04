
import { db } from '../config/database.js';

export interface FoodCategory {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    description?: string;
    image_url?: string;
}

export interface Ingredient {
    id: number;
    name: string;
    slug: string;
    category_id: number | null;
    description?: string;
    image_url?: string;
    is_pantry_staple: boolean;
    is_common: boolean;
    brand?: string;
}

export interface FoodNode {
    id: number;
    name: string;
    slug: string;
    type: 'category' | 'ingredient';
    parent_id: number | null;
    description?: string;
    image_url?: string;
}

export async function getTopCategories(): Promise<FoodCategory[]> {
    return db('food_categories')
        .whereNull('parent_id')
        .where('is_deleted', false)
        .select('*')
        .orderBy('name', 'asc');
}

export async function getCategory(id: number): Promise<FoodCategory | undefined> {
    return db('food_categories')
        .where({ id, is_deleted: false })
        .first();
}

export async function getCategoryChildren(categoryId: number): Promise<{ categories: FoodCategory[], ingredients: Ingredient[] }> {
    const categories = await db('food_categories')
        .where({ parent_id: categoryId, is_deleted: false })
        .select('*')
        .orderBy('name', 'asc');

    const ingredients = await db('ingredients')
        .where({ category_id: categoryId, is_deleted: false })
        .select('*')
        .orderBy('name', 'asc');

    return { categories, ingredients };
}

export async function getCategoryAncestry(categoryId: number): Promise<FoodCategory[]> {
    const ancestry: FoodCategory[] = [];
    let currentId: number | null = categoryId;

    // Limits the depth to prevent infinite loops if data is corrupted
    for (let i = 0; i < 10; i++) {
        if (!currentId) break;
        const cat: FoodCategory | undefined = await db('food_categories').where({ id: currentId }).first();
        if (!cat) break;
        ancestry.unshift(cat);
        currentId = cat.parent_id;
    }

    return ancestry;
}

export async function getIngredient(id: number): Promise<Ingredient | undefined> {
    return db('ingredients')
        .where({ id, is_deleted: false })
        .first();
}

export async function getIngredientSubstitutions(ingredientId: number): Promise<Ingredient[]> {
    return db('ingredient_substitutions')
        .join('ingredients', 'ingredient_substitutions.substitute_id', 'ingredients.id')
        .where('ingredient_substitutions.ingredient_id', ingredientId)
        .select('ingredients.*');
}

export async function getIngredientAliases(ingredientId: number): Promise<string[]> {
    const rows = await db('ingredient_aliases')
        .where({ ingredient_id: ingredientId })
        .select('alias');
    return rows.map(r => r.alias);
}

export async function searchFood(query: string, limit = 50): Promise<{ categories: FoodCategory[], ingredients: Ingredient[] }> {
    const categories = await db('food_categories')
        .where('name', 'like', `%${query}%`)
        .where('is_deleted', false)
        .limit(limit);

    const ingredients = await db('ingredients')
        .where('name', 'like', `%${query}%`)
        .where('is_deleted', false)
        .limit(limit);

    return { categories, ingredients };
}
