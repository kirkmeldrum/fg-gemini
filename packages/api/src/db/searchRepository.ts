
import { db } from '../config/database.js';

export interface SearchFilters {
    max_missing?: number;
    cuisine?: string;
    difficulty?: string;
    query?: string;
    assume_pantry_staples?: boolean;
}

export interface RecipeMatchResult {
    id: number;
    title: string;
    slug: string;
    image_url: string | null;
    cuisine: string | null;
    difficulty: string | null;
    prep_time: number | null;
    cook_time: number | null;
    servings: number | null;
    total_ingredients: number;
    owned_ingredients: number;
    coverage_percentage: number;
    missing_ingredients: string[];
}

/**
 * Smart Search Engine (REQ-006)
 */
export async function smartSearch(userId: number, householdId: number | null, filters: SearchFilters = {}) {
    // 1. Get user's inventory + their categories + substitutions
    const inventoryQuery = db('user_inventory')
        .select('ingredient_id')
        .where('is_deleted', false);

    if (householdId) {
        inventoryQuery.where('household_id', householdId);
    } else {
        inventoryQuery.where('user_id', userId);
    }

    const inventory = await inventoryQuery;
    const inventoryIngIds = inventory.map(i => i.ingredient_id);
    const ownedIds = new Set(inventoryIngIds);

    // 2. Identify pantry staples
    let stapleIds: number[] = [];
    if (filters.assume_pantry_staples !== false) {
        const staples = await db('ingredients')
            .select('id')
            .where('is_pantry_staple', true);
        stapleIds = staples.map(s => s.id);
    }

    // 3. Taxonomy Awareness (REQ-006.3)
    // Find all ingredients in the same category or child categories of what we have
    // This is a simplification: if you have a specific ingredient, you satisfy that category's "generic" requirements
    const ownedCategories = await db('ingredients')
        .select('category_id')
        .whereIn('id', inventoryIngIds)
        .whereNotNull('category_id');

    const catIds = ownedCategories.map(c => c.category_id);

    // Find all ingredients that belong to the same category hierarchies
    // For now, let's just get everything in the same immediate category
    const sameCategoryIngredients = await db('ingredients')
        .select('id')
        .whereIn('category_id', catIds);

    const taxonomyOwnedIds = new Set(sameCategoryIngredients.map(i => i.id));

    // 4. Substitution Awareness (REQ-006.4)
    const substitutions = await db('ingredient_substitutions')
        .select('ingredient_id', 'substitute_id', 'match_type')
        .whereIn('substitute_id', Array.from(ownedIds));

    const substitutionMap = new Map<number, string>();
    substitutions.forEach(s => {
        substitutionMap.set(s.ingredient_id, s.match_type);
    });

    // 5. Get all recipes with their ingredients
    const baseQuery = db('recipes')
        .where('recipes.is_deleted', false)
        .where('recipes.privacy', 'public');

    if (filters.cuisine) {
        baseQuery.where('recipes.cuisine', filters.cuisine);
    }
    if (filters.difficulty) {
        baseQuery.where('recipes.difficulty', filters.difficulty);
    }
    if (filters.query) {
        baseQuery.where('recipes.title', 'LIKE', `%${filters.query}%`);
    }

    const recipes = await baseQuery;

    // 4. Calculate coverage for each recipe
    // For large datasets, this would be a single complex SQL query.
    // For MVP/Dev, we can optimize by fetching recipe_ingredients in bulk.
    const recipeIds = recipes.map(r => r.id);
    if (recipeIds.length === 0) return [];

    const allRecipeIngredients = await db('recipe_ingredients')
        .select('recipe_id', 'ingredient_id', 'name_display', 'is_optional')
        .whereIn('recipe_id', recipeIds);

    const matches: RecipeMatchResult[] = recipes.map(recipe => {
        const recipeIngs = allRecipeIngredients.filter(ri => ri.recipe_id === recipe.id);
        const total = recipeIngs.length;

        const missingList: string[] = [];
        let ownedScore = 0;
        let ownedCount = 0;

        recipeIngs.forEach(ri => {
            const exactMatch = ri.ingredient_id && (ownedIds.has(ri.ingredient_id) || stapleIds.includes(ri.ingredient_id));
            const taxonomyMatch = ri.ingredient_id && taxonomyOwnedIds.has(ri.ingredient_id);
            const substitutionType = ri.ingredient_id ? substitutionMap.get(ri.ingredient_id) : null;

            if (exactMatch || ri.is_optional) {
                ownedScore += 1;
                ownedCount += 1;
            } else if (taxonomyMatch) {
                ownedScore += 0.9; // Taxonomy match is slightly less than exact
                ownedCount += 1;
            } else if (substitutionType) {
                // REQ-006.4: full matches count as 1.0, substitutions as 0.75
                const score = substitutionType === 'exact' ? 1.0 : (substitutionType === 'close' ? 0.75 : 0.5);
                ownedScore += score;
                ownedCount += 1;
            } else {
                missingList.push(ri.name_display);
            }
        });

        const coverage = total > 0 ? (ownedScore / total) * 100 : 100;

        return {
            ...recipe,
            total_ingredients: total,
            owned_ingredients: ownedCount,
            coverage_percentage: Math.round(coverage),
            missing_ingredients: missingList
        };
    });

    // 5. Filter by max_missing and sort by coverage
    const maxMissing = filters.max_missing ?? 5;

    return matches
        .filter(m => (m.total_ingredients - m.owned_ingredients) <= maxMissing)
        .sort((a, b) => b.coverage_percentage - a.coverage_percentage);
}

/**
 * Get coverage stats (REQ-006.1)
 */
export async function getCoverageStats(userId: number, householdId: number | null) {
    const allMatches = await smartSearch(userId, householdId, { max_missing: 100 });

    return {
        total: allMatches.length,
        fully_matched: allMatches.filter(m => m.coverage_percentage === 100).length,
        almost_there: allMatches.filter(m => m.coverage_percentage >= 80 && m.coverage_percentage < 100).length,
        needs_shopping: allMatches.filter(m => m.coverage_percentage < 80).length
    };
}
