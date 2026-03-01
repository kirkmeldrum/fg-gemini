// ============================================
// Meal Plan Repository
// Knex queries for meal plans
// ============================================

import { db } from '../config/database.js';

/**
 * Get meal plan for a user within a date range
 */
export async function getMealPlan(userId: number, startDate: string, endDate: string) {
    return db('meal_plans')
        .where({ user_id: userId })
        .where('plan_date', '>=', startDate)
        .where('plan_date', '<=', endDate)
        .orderBy('plan_date', 'asc')
        .orderBy('meal_type', 'asc');
}

/**
 * Find a specific meal by ID
 */
export async function findById(id: number) {
    return db('meal_plans')
        .where({ id })
        .first();
}

/**
 * Add a meal to the plan
 */
export async function create(userId: number, data: {
    recipe_id: number;
    plan_date: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings?: number;
    notes?: string;
    household_id?: number;
}) {
    const [id] = await db('meal_plans').insert({
        ...data,
        user_id: userId,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
    }).returning('id');

    return id.id || id;
}

/**
 * Update a planned meal
 */
export async function update(userId: number, id: number, data: {
    servings?: number;
    is_cooked?: boolean;
    notes?: string;
    plan_date?: string;
    meal_type?: string;
}) {
    return db('meal_plans')
        .where({ id, user_id: userId })
        .update({
            ...data,
            updated_at: db.fn.now()
        });
}

/**
 * Remove a meal from the plan
 */
export async function remove(userId: number, id: number) {
    return db('meal_plans')
        .where({ id, user_id: userId })
        .delete();
}

/**
 * Aggregate ingredients for a date range and subtract inventory to find what to buy
 */
export async function aggregateShoppingList(userId: number, householdId: number | null, startDate: string, endDate: string) {
    // 1. Get all recipe ingredients in the plan
    const needed = await db('meal_plans')
        .join('recipe_ingredients', 'meal_plans.recipe_id', 'recipe_ingredients.recipe_id')
        .join('ingredients', 'recipe_ingredients.ingredient_id', 'ingredients.id')
        .where({ 'meal_plans.user_id': userId })
        .where('plan_date', '>=', startDate)
        .where('plan_date', '<=', endDate)
        .select(
            'ingredients.id as ingredient_id',
            'ingredients.name as ingredient_name',
            'recipe_ingredients.unit',
            db.raw('SUM(recipe_ingredients.quantity * meal_plans.servings) as total_needed')
        )
        .groupBy('ingredients.id', 'ingredients.name', 'recipe_ingredients.unit');

    // 2. Get current inventory
    const inventory = await db('user_inventory')
        .where({ user_id: userId, is_deleted: false })
        .modify((qb) => {
            if (householdId) qb.where({ household_id: householdId });
        })
        .select('ingredient_id', 'unit', db.raw('SUM(quantity) as current_quantity'))
        .groupBy('ingredient_id', 'unit');

    // 3. Subtract inventory and format for shopping list
    const toBuy = needed.map(item => {
        const inv = inventory.find((i: any) => i.ingredient_id === item.ingredient_id && i.unit === item.unit);
        const currentQty = inv ? inv.current_quantity : 0;
        const diff = item.total_needed - currentQty;

        if (diff > 0) {
            return {
                ingredient_id: item.ingredient_id,
                name_display: item.ingredient_name,
                quantity: diff,
                unit: item.unit
            };
        }
        return null;
    }).filter(item => item !== null);

    return toBuy;
}

/**
 * Get nutrition summary for a date range
 */
export async function getNutritionSummary(userId: number, startDate: string, endDate: string) {
    // Join meal_plans with recipe_nutrition
    return db('meal_plans')
        .leftJoin('recipe_nutrition', 'meal_plans.recipe_id', 'recipe_nutrition.recipe_id')
        .where({ 'meal_plans.user_id': userId })
        .where('plan_date', '>=', startDate)
        .where('plan_date', '<=', endDate)
        .select(
            db.raw('COALESCE(SUM(recipe_nutrition.calories * meal_plans.servings), 0) as total_calories'),
            db.raw('COALESCE(SUM(recipe_nutrition.protein * meal_plans.servings), 0) as total_protein'),
            db.raw('COALESCE(SUM(recipe_nutrition.carbs * meal_plans.servings), 0) as total_carbs'),
            db.raw('COALESCE(SUM(recipe_nutrition.fat * meal_plans.servings), 0) as total_fat')
        )
        .first();
}
