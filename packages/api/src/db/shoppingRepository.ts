import { db } from '../config/database.js';

export interface ShoppingItem {
    id: number;
    user_id: number;
    household_id: number | null;
    ingredient_id: number | null;
    name_display: string;
    quantity: number | null;
    unit: string | null;
    is_checked: boolean;
    source_recipe_id: number | null;
    source_label: string | null;
    checked_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * List shopping list items
 */
export async function list(userId: number, householdId: number | null): Promise<ShoppingItem[]> {
    const query = db('shopping_list_items')
        .where('is_checked', false); // Usually we only want unchecked items first

    if (householdId) {
        query.where('household_id', householdId);
    } else {
        query.where('user_id', userId);
    }

    return query.orderBy('created_at', 'desc');
}

/**
 * Add item to shopping list
 */
export async function add(item: Partial<ShoppingItem>): Promise<number> {
    const [id] = await db('shopping_list_items').insert(item).returning('id');
    return typeof id === 'object' ? id.id : id;
}

/**
 * Toggle checked status
 */
export async function toggleChecked(id: number, isChecked: boolean): Promise<void> {
    await db('shopping_list_items')
        .where({ id })
        .update({
            is_checked: isChecked,
            checked_at: isChecked ? db.fn.now() : null,
            updated_at: db.fn.now(),
        });
}

/**
 * Remove item
 */
export async function remove(id: number): Promise<void> {
    await db('shopping_list_items')
        .where({ id })
        .delete(); // Shopping lists are usually hard deleted or archived
}

/**
 * Generate shared list for a recipe (REQ-007)
 */
export async function addFromRecipe(userId: number, householdId: number | null, recipeId: number) {
    const ingredients = await db('recipe_ingredients')
        .where({ recipe_id: recipeId });

    // Check if user already owns these items (optional matching)
    const inventory = await db('user_inventory')
        .where({ is_deleted: false })
        .andWhere((builder) => {
            if (householdId) builder.where('household_id', householdId);
            else builder.where('user_id', userId);
        });

    const ownedIds = new Set(inventory.filter(i => i.ingredient_id).map(i => i.ingredient_id));

    const itemsToAdd = ingredients
        .filter(ing => !ing.ingredient_id || !ownedIds.has(ing.ingredient_id))
        .map(ing => ({
            user_id: userId,
            household_id: householdId,
            ingredient_id: ing.ingredient_id,
            name_display: ing.name_display,
            quantity: ing.quantity,
            unit: ing.unit,
            source_recipe_id: recipeId,
            source_label: 'Added from recipe',
        }));

    if (itemsToAdd.length > 0) {
        await db('shopping_list_items').insert(itemsToAdd);
    }

    return itemsToAdd.length;
}
