import knex from 'knex';
import * as fs from 'fs';
import * as path from 'path';

const RECIPES_PATH = path.join(__dirname, '..', '..', 'data', 'migration', 'bulk_recipes.json');
const INGREDIENTS_PATH = path.join(__dirname, '..', '..', 'data', 'migration', 'bulk_ingredients.json');

const dbConfig = {
    client: 'mssql',
    connection: {
        host: 'localhost',
        port: 1433,
        user: 'sa',
        password: 'VU6ex?S6ICh',
        database: 'FoodGenieGemini',
        options: {
            enableArithAbort: true,
            trustServerCertificate: true
        }
    }
};

const db = knex(dbConfig);

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function parseQuantity(val: string): number | null {
    if (!val) return null;
    val = val.trim();

    // Handle "1 1/2"
    if (val.includes(' ') && !val.includes('(')) {
        const parts = val.split(' ');
        let total = 0;
        for (const p of parts) {
            total += parseQuantity(p) || 0;
        }
        return total || null;
    }

    // Handle fractions "1/2"
    if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
        }
    }

    // Handle leading number "1 (15 ounce)" or "2 packages"
    const m = val.match(/^([\d\.]+)/);
    if (m) return parseFloat(m[1]);

    return null;
}

function scrubIngredientLabel(name: string): string {
    return name
        .toLowerCase()
        // Broadly remove leading measurements in parentheses e.g. (1 1/2 inch)
        .replace(/^\(.*?\)[\s,]*/, '')
        // Remove leading quantities/ranges e.g. 1 1/2, 2-3
        .replace(/^[\d\.\s\/-]+/, '')
        // Remove common units and filler adjectives at the start
        .replace(/^(cup|tablespoon|teaspoon|ounce|pound|lb|can|package|bag|clove|slice|medium|small|large|stick|dash|pinch|drop|gram|kg|ml|liter|envelope|jar|piece|recipe|box|head|stalk|bunch|tin|container)s?(\s+of)?\s+/i, '')
        // Clean up common adjectives that don't differentiate ingredients
        .replace(/^(chopped|minced|sliced|diced|grated|shredded|crushed|melted|beaten|prepared|warm|hot|ice\s+cold|cold|freshly|pureed|softened|sifted|toasted|roasted)\s+/i, '')
        // Remove trailing preparation info after comma e.g. tomato, chopped
        .replace(/,\s+.*$/, '')
        .trim();
}

async function runImport() {
    console.log('Starting normalized bulk import with ingredient scrubbing...');

    // 1. Load Data
    const recipesRaw = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf8'));
    const ingredientsRaw = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));

    // 2. Comprehensive Cleanup
    console.log('Cleaning all recipe and ingredient tables for fresh reload...');
    try {
        await db('meal_plans').del();
        await db('shopping_list_items').del();
        await db('user_favorites').del();
        await db('recipe_ratings').del();
        await db('recipe_nutrition').del();
        await db('recipe_tags').del();
        await db('recipe_ingredients').del();
        await db('recipe_steps').del();
        await db('recipes').update({ parse_log_id: null });
        await db('recipe_parse_log').del();
        await db('recipes').del();

        // NEW: Scrub ingredients for clean reload - handle extra constraints
        await db('user_inventory').del();
        await db('ingredient_substitutions').del();
        await db('ingredient_aliases').del();
        await db('ingredient_allergens').del();
        await db('ingredients').del();
    } catch (err: any) {
        console.warn('Wipe warning:', err.message);
    }

    // 3. Build Unique Ingredients Map
    console.log('Building canonical ingredient list...');
    const canonicalSet = new Set<string>();
    ingredientsRaw.forEach((i: any) => {
        if (i.ingr_name) {
            const canonical = scrubIngredientLabel(i.ingr_name);
            if (canonical.length > 2) {
                canonicalSet.add(canonical);
            }
        }
    });

    const ingrMap = new Map<string, number>(); // canonical_name -> modern_id
    const ingrArray = Array.from(canonicalSet);

    console.log(`Syncing ${ingrArray.length} items to ingredients table...`);
    for (let i = 0; i < ingrArray.length; i += 500) {
        const chunk = ingrArray.slice(i, i + 500);
        for (const name of chunk) {
            const truncatedName = name.substring(0, 255);
            const slug = slugify(name).substring(0, 280) || `ingr-${Math.random().toString(36).substring(2, 7)}`;

            try {
                const [idObj] = await db('ingredients').insert({
                    name: truncatedName,
                    slug: slug,
                    is_common: 0
                }).returning('id');
                const id = typeof idObj === 'object' ? idObj.id : idObj;
                ingrMap.set(name, id);
            } catch (err: any) {
                const existing = await db('ingredients').where('slug', slug).first();
                if (existing) ingrMap.set(name, existing.id);
            }
        }
    }

    // 4. Batch Import Recipes
    console.log(`Importing ${recipesRaw.length} recipes with normalized ingredients...`);

    // Index ingredients by recipe_id
    const ingrByRecipe = new Map<number, any[]>();
    ingredientsRaw.forEach((i: any) => {
        if (!ingrByRecipe.has(i.recipe_id)) ingrByRecipe.set(i.recipe_id, []);
        ingrByRecipe.get(i.recipe_id)!.push(i);
    });

    for (let i = 0; i < recipesRaw.length; i += 100) {
        const chunk = recipesRaw.slice(i, i + 100);

        await db.transaction(async (trx) => {
            for (const r of chunk) {
                const title = r.title.substring(0, 200);
                const slug = `${slugify(r.title).substring(0, 240)}-${r.id}`;

                const [idObj] = await trx('recipes').insert({
                    title: title,
                    slug: slug,
                    source_url: r.source_url,
                    image_url: r.image_url,
                    privacy: 'public',
                    created_at: new Date(),
                    updated_at: new Date()
                }).returning('id');
                const modernId = typeof idObj === 'object' ? idObj.id : idObj;

                // Steps
                const stepsToInsert = r.directions.map((d: string, idx: number) => ({
                    recipe_id: modernId,
                    step_number: idx + 1,
                    instruction: d,
                    created_at: new Date(),
                    updated_at: new Date()
                }));
                if (stepsToInsert.length > 0) await trx('recipe_steps').insert(stepsToInsert);

                // Ingredients (NORMALIZED to Scrubbed Canonical Label)
                const rawItems = ingrByRecipe.get(r.id) || [];
                const linksToInsert = rawItems.map((ri: any, idx: number) => {
                    const canonical = scrubIngredientLabel(ri.ingr_name || '');
                    const modernIngrId = ingrMap.get(canonical);

                    return {
                        recipe_id: modernId,
                        ingredient_id: modernIngrId || null,
                        name_display: (ri.source_line || '').substring(0, 255),
                        quantity: parseQuantity(String(ri.quantity || '')),
                        unit: (ri.unit || '').substring(0, 50),
                        prep_state: (ri.prep_state || '').substring(0, 100),
                        sort_order: idx,
                        created_at: new Date(),
                        updated_at: new Date()
                    };
                });
                if (linksToInsert.length > 0) await trx('recipe_ingredients').insert(linksToInsert);
            }
        });

        if (i % 500 === 0) {
            console.log(`Processed ${i}/${recipesRaw.length} recipes`);
        }
    }

    console.log('Bulk normalized import complete!');
    await db.destroy();
}

runImport().catch(console.error);
