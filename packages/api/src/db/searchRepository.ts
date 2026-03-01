
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
    // 1. Get user's inventory
    const inventoryQuery = db('user_inventory')
        .select('ingredient_id')
        .where('is_deleted', false);

    if (householdId) {
        inventoryQuery.where('household_id', householdId);
    } else {
        inventoryQuery.where('user_id', userId);
    }

    const inventory = await inventoryQuery;
    const inventoryIngIds = inventory.map(i => i.ingredient_id).filter(id => id !== null) as number[];
    const ownedIds = new Set(inventoryIngIds);

    // 2. Identify pantry staples
    let stapleIds: number[] = [];
    if (filters.assume_pantry_staples !== false) {
        const staples = await db('ingredients')
            .select('id')
            .where('is_pantry_staple', true);
        stapleIds = staples.map(s => s.id);
    }
    const stapleSet = new Set(stapleIds);

    // 3. Taxonomy Awareness (REQ-006.3)
    // Fetch all ingredients to map to categories
    const allIngredients = await db('ingredients').select('id', 'category_id');
    const ingredientCategoryMap = new Map<number, number>();
    allIngredients.forEach(i => {
        if (i.category_id) ingredientCategoryMap.set(i.id, i.category_id);
    });

    // Build the "Owned Categories" set, including parents of owned categories
    const allCats = await db('food_categories').select('id', 'parent_id');
    const catParentMap = new Map<number, number>();
    allCats.forEach(c => {
        if (c.parent_id !== null) catParentMap.set(c.id, c.parent_id);
    });

    const ownedCategoryHierarchy = new Set<number>();
    inventoryIngIds.forEach(id => {
        let current: number | undefined = ingredientCategoryMap.get(id);
        while (current !== undefined) {
            ownedCategoryHierarchy.add(current);
            current = catParentMap.get(current);
        }
    });

    // 4. Substitution Awareness (REQ-006.4)
    const substitutions = await db('ingredient_substitutions')
        .select('ingredient_id', 'substitute_id', 'match_type')
        .whereIn('substitute_id', Array.from(ownedIds));

    const substitutionMap = new Map<number, string>();
    substitutions.forEach(s => {
        const current = substitutionMap.get(s.ingredient_id);
        if (!current || (s.match_type === 'exact' && current !== 'exact')) {
            substitutionMap.set(s.ingredient_id, s.match_type);
        }
    });

    // 5. Get all recipes
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
    const recipeIds = recipes.map(r => r.id);
    if (recipeIds.length === 0) return [];

    const allRecipeIngredients = await db('recipe_ingredients')
        .select('recipe_id', 'ingredient_id', 'name_display', 'is_optional')
        .whereIn('recipe_id', recipeIds);

    const matches: RecipeMatchResult[] = recipes.map(recipe => {
        const recipeIngs = allRecipeIngredients.filter(ri => ri.recipe_id === recipe.id);
        const mandatoryIngs = recipeIngs.filter(ri => !ri.is_optional);
        const total = mandatoryIngs.length || 1;

        const missingList: string[] = [];
        let ownedScore = 0;
        let ownedCountByMatch = 0;

        recipeIngs.forEach(ri => {
            if (ri.is_optional) return;

            const exactMatch = ri.ingredient_id && (ownedIds.has(ri.ingredient_id) || stapleSet.has(ri.ingredient_id));
            const riCatId = ri.ingredient_id ? ingredientCategoryMap.get(ri.ingredient_id) : null;
            const taxonomyMatch = riCatId && ownedCategoryHierarchy.has(riCatId);
            const substitutionType = ri.ingredient_id ? substitutionMap.get(ri.ingredient_id) : null;

            if (exactMatch) {
                ownedScore += 1.0;
                ownedCountByMatch += 1;
            } else if (taxonomyMatch) {
                ownedScore += 1.0; // REQ-006.3: Specific matches generic
                ownedCountByMatch += 1;
            } else if (substitutionType) {
                const score = substitutionType === 'exact' ? 1.0 : (substitutionType === 'close' ? 0.75 : 0.5);
                ownedScore += score;
                if (score >= 0.75) ownedCountByMatch += 1;
            } else {
                missingList.push(ri.name_display);
            }
        });

        const coverage = (ownedScore / total) * 100;

        return {
            ...recipe,
            total_ingredients: total, // Use mandatory count for stat
            owned_ingredients: ownedCountByMatch,
            coverage_percentage: Math.min(100, Math.round(coverage)),
            missing_ingredients: missingList
        };
    });

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
