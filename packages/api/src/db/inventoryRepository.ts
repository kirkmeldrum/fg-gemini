import { db } from '../config/database.js';

export interface InventoryItem {
    id: number;
    user_id: number;
    household_id: number | null;
    ingredient_id: number;
    product_name: string | null;
    quantity: number;
    unit: string;
    storage_location: 'pantry' | 'fridge' | 'freezer' | 'spice_rack' | 'other';
    expiration_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface InventoryItemWithIngredient extends InventoryItem {
    ingredient_name: string;
    ingredient_slug: string;
    category_name: string | null;
}

/**
 * List inventory items for a user or their household
 */
export async function list(userId: number, householdId: number | null): Promise<InventoryItemWithIngredient[]> {
    const query = db('user_inventory')
        .join('ingredients', 'user_inventory.ingredient_id', 'ingredients.id')
        .leftJoin('food_categories', 'ingredients.category_id', 'food_categories.id')
        .select(
            'user_inventory.*',
            'ingredients.name as ingredient_name',
            'ingredients.slug as ingredient_slug',
            'food_categories.name as category_name'
        )
        .where('user_inventory.is_deleted', false);

    if (householdId) {
        query.where('user_inventory.household_id', householdId);
    } else {
        query.where('user_inventory.user_id', userId);
    }

    return query.orderBy('ingredients.name', 'asc');
}

/**
 * Find a specific inventory item by ID
 */
export async function findById(id: number): Promise<InventoryItem | undefined> {
    return db('user_inventory')
        .where({ id, is_deleted: false })
        .first();
}

/**
 * Add a new item to inventory
 */
export async function add(item: Partial<InventoryItem>): Promise<number> {
    const [id] = await db('user_inventory').insert(item).returning('id');
    return typeof id === 'object' ? id.id : id;
}

/**
 * Update an existing inventory item
 */
export async function update(id: number, updates: Partial<InventoryItem>): Promise<void> {
    await db('user_inventory')
        .where({ id })
        .update({
            ...updates,
            updated_at: db.fn.now(),
        });
}

/**
 * Soft-delete an inventory item
 */
export async function remove(id: number): Promise<void> {
    await db('user_inventory')
        .where({ id })
        .update({
            is_deleted: true,
            updated_at: db.fn.now(),
        });
}

/**
 * Get recipes that can be made with current inventory
 * Basic matching logic (REQ-006.4)
 */
export async function getMatchingRecipes(userId: number, householdId: number | null) {
    // Get all ingredient IDs in inventory
    const inventorySubquery = db('user_inventory')
        .select('ingredient_id')
        .where('is_deleted', false);

    if (householdId) {
        inventorySubquery.where('household_id', householdId);
    } else {
        inventorySubquery.where('user_id', userId);
    }

    // Find recipes where user owns some or all ingredients
    const recipes = await db('recipes')
        .select('recipes.*')
        .join('recipe_ingredients', 'recipes.id', 'recipe_ingredients.recipe_id')
        .leftJoin(
            inventorySubquery.as('owned'),
            'recipe_ingredients.ingredient_id',
            'owned.ingredient_id'
        )
        .where('recipes.is_deleted', false)
        .groupBy('recipes.id')
        .havingRaw('COUNT(owned.ingredient_id) > 0') // At least one ingredient owned
        .orderByRaw('COUNT(owned.ingredient_id) * 100.0 / COUNT(recipe_ingredients.id) DESC'); // Sort by match percentage

    return recipes;
}
