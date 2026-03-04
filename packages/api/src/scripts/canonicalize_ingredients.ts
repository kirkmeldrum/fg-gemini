import 'dotenv/config';
import { db } from '../config/database.js';

/**
 * Stage 3: Advanced Ingredient Canonicalization v2.0
 * Uses patterns from FoodNLP research to map descriptive ingredient names.
 * Migrates recipe_ingredients to point to clean canonical IDs.
 */

const NOISE_WORDS = new Set([
    'chopped', 'diced', 'sliced', 'minced', 'grated', 'shredded', 'crushed',
    'fresh', 'dried', 'frozen', 'canned', 'large', 'small', 'medium',
    'packed', 'optional', 'plus', 'additional', 'divided', 'to taste',
    'extra-virgin', 'all-purpose', 'low-fat', 'lean', 'fat-free', 'reduced-sodium',
    'softened', 'melted', 'beaten', 'chilled', 'room temperature', 'halved',
    'quartered', 'peeled', 'seeded', 'rinsed', 'drained', 'thawed',
    'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'cup', 'cups',
    'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds', 'clove', 'cloves',
    'package', 'packages', 'pkg', 'container', 'containers', 'can', 'cans',
    'bottle', 'bottles', 'jar', 'jars', 'bag', 'bags', 'stems', 'stalks', 'heads'
]);

// Common measurement units to strip via regex (numbers, fractions, units)
const MEASUREMENT_REGEX = /^(\d+[\/\-]?\d*\s+)?(tablespoons?|teaspoons?|cups?|ounces?|oz|lb|lbs|pounds?|cloves?|packages?|pkg|containers?|cans?|bottles?|g|mg|ml|kg|ea|each|stalks?|heads?)\.?\s+/i;

const COMPOUND_NOUNS = new Set([
    'brown sugar', 'confectioners sugar', 'olive oil', 'soy sauce',
    'garlic powder', 'onion powder', 'sour cream', 'cream cheese',
    'parmesan cheese', 'cheddar cheese', 'black pepper', 'kosher salt',
    'all-purpose flour', 'baking powder', 'baking soda', 'vanilla extract',
    'beef broth', 'chicken broth', 'vegetable broth', 'canola oil', 'vegetable oil',
    'red wine vinegar', 'white wine vinegar', 'balsamic vinegar'
]);

async function canonicalizeIngredients() {
    console.log('=== FoodGenie Ingredient Canonicalizer v2.0 ===');

    // Get all ingredients for comprehensive analysis
    const rawIngredients = await db('ingredients').select('id', 'name');

    console.log(`Analyzing ${rawIngredients.length} ingredients for cleanup...`);

    let newCanonicalCount = 0;
    let migrations = 0;
    let newAliases = 0;

    for (const ing of rawIngredients) {
        const originalName = ing.name.toLowerCase();
        let canonicalName = originalName;

        // 1. Strip quantities and units from start
        canonicalName = canonicalName.replace(MEASUREMENT_REGEX, '').trim();

        // 2. Remove parentheticals
        canonicalName = canonicalName.replace(/\(.*\)/g, '').trim();

        // 3. Remove commas and trailing phrases
        if (canonicalName.includes(',')) {
            canonicalName = canonicalName.split(',')[0].trim();
        }

        // 4. Tokenize and Filter Noise
        const tokens = canonicalName.split(/\s+/);
        // Also filter out pure numeric tokens (quantities)
        const filteredTokens = tokens.filter(t => !NOISE_WORDS.has(t) && !/^\d+[\/\-]?\d*$/.test(t));

        // Reconstruct
        const cleaned = filteredTokens.join(' ').trim();

        // 5. Check for compound nouns
        let finalCanonical = cleaned;
        for (const compound of COMPOUND_NOUNS) {
            if (cleaned.includes(compound)) {
                finalCanonical = compound;
                break;
            }
        }

        // Only act if we found a simplification and it's not empty
        if (finalCanonical !== originalName && finalCanonical.length > 0) {
            let canonicalId: number;

            // Derive slug
            const slug = finalCanonical.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const existingCanonical = await db('ingredients')
                .where('name', finalCanonical)
                .orWhere('slug', slug)
                .first();

            if (existingCanonical) {
                canonicalId = existingCanonical.id;
            } else {
                // Insert new canonical
                try {
                    await db('ingredients').insert({
                        name: finalCanonical,
                        slug: slug,
                        is_pantry_staple: 0
                    });

                    const [lastId] = await db('ingredients').where('slug', slug).select('id');
                    canonicalId = lastId.id;
                    newCanonicalCount++;
                } catch (err) {
                    // Fallback: if insert fails (race condition or index issue), try to find again
                    const retry = await db('ingredients').where('slug', slug).first();
                    if (retry) {
                        canonicalId = retry.id;
                    } else {
                        continue; // Skip this one if we can't get a canonical ID
                    }
                }
            }

            // 6. Migrate recipe_ingredients
            if (canonicalId !== ing.id) {
                const affected = await db('recipe_ingredients')
                    .where('ingredient_id', ing.id)
                    .update({ ingredient_id: canonicalId });
                migrations += affected;
            }

            // 7. Create Alias mapping
            const existingAlias = await db('ingredient_aliases')
                .where({ ingredient_id: canonicalId, alias: originalName })
                .first();

            if (!existingAlias) {
                await db('ingredient_aliases').insert({
                    ingredient_id: canonicalId,
                    alias: originalName
                });
                newAliases++;
            }
        }
    }

    console.log(`\n=== FINISHED ===`);
    console.log(`New Canonical Ingredients Created: ${newCanonicalCount}`);
    console.log(`Recipe Ingredient Links Migrated: ${migrations}`);
    console.log(`New Alias Mappings: ${newAliases}`);

    await db.destroy();
}

canonicalizeIngredients();
