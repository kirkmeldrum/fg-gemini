import knex from 'knex';

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

function scrubIngredientLabel(name: string): string {
    let clean = name.toLowerCase()
        .replace(/┬«/g, '')
        .replace(/Γäó/g, '')
        .replace(/[®™]/g, '')
        .replace(/^\(.*?\)[\s,]*/, '')
        .replace(/\s*\(.*?(?:\)|$)/g, '');

    let last = '';
    while (clean !== last) {
        last = clean;
        clean = clean
            .replace(/^[\d\.\s\/-]+/, '')
            .replace(/^(additional|and|or|\+)\s+/i, '')
            .replace(/^(cup|tablespoon|teaspoon|oz|ounce|pound|lb|can|package|bag|clove|slice|medium|small|large|stick|dash|pinch|drop|gram|kg|ml|liter|envelope|jar|piece|recipe|box|head|stalk|bunch|tin|container|link|bottle)s?(\s+of)?\s+/i, '')
            .replace(/^(chopped|minced|sliced|diced|grated|shredded|crushed|melted|beaten|prepared|warm|hot|ice\s+cold|cold|fresh|freshly|pureed|softened|sifted|toasted|roasted)\s+/i, '')
            .trim();
    }

    clean = clean
        .replace(/,\s+.*$/, '')
        .replace(/\s+-\s+.*$/, '')
        .replace(/\s+to taste.*$/i, '')
        .replace(/\s+as needed.*$/i, '')
        .replace(/\s+optional.*$/i, '')
        .replace(/\s+for garnish.*$/i, '')
        .replace(/\s+for serving.*$/i, '')
        .replace(/\s+for coating.*$/i, '')
        .replace(/\s+sliced into.*$/i, '')
        .replace(/:$/, '')
        .trim();

    return clean;
}

async function runMerge() {
    console.log('Starting Ingredient Merging (Deduplication)...');

    const ingredients = await db('ingredients').select('id', 'name');
    const collisions = new Map<string, number[]>();

    for (const ingr of ingredients) {
        const cleaned = scrubIngredientLabel(ingr.name);
        if (!collisions.has(cleaned)) {
            collisions.set(cleaned, []);
        }
        collisions.get(cleaned)!.push(ingr.id);
    }

    const actualCollisions = Array.from(collisions.entries()).filter(([name, ids]) => ids.length > 1);
    console.log(`Found ${actualCollisions.length} collision groups to merge.`);

    let totalMerged = 0;
    let totalRecipeIngrFixed = 0;

    for (const [cleanName, ids] of actualCollisions) {
        // Winner is the first ID (usually the one that might have more data or just arbitrary)
        const winnerId = ids[0];
        const losers = ids.slice(1);

        // 1. Update winner's name to the clean name if not already
        const winnerObj = ingredients.find(i => i.id === winnerId)!;
        if (winnerObj.name !== cleanName) {
            const newSlug = cleanName.replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
            try {
                await db('ingredients').where('id', winnerId).update({
                    name: cleanName,
                    slug: newSlug,
                    updated_at: new Date()
                });
            } catch (err) {
                // Potential slug collision if another ingredient has this slug but different name
            }
        }

        // 2. Re-point related tables for all losers
        for (const loserId of losers) {
            // recipe_ingredients
            const riUpdated = await db('recipe_ingredients').where('ingredient_id', loserId).update({ ingredient_id: winnerId });
            totalRecipeIngrFixed += riUpdated;

            // user_inventory
            await db('user_inventory').where('ingredient_id', loserId).update({ ingredient_id: winnerId });

            // shopping_list_items
            await db('shopping_list_items').where('ingredient_id', loserId).update({ ingredient_id: winnerId });

            // ingredient_aliases
            await db('ingredient_aliases').where('ingredient_id', loserId).update({ ingredient_id: winnerId });

            // ingredient_allergens (unique constraint warning)
            try {
                await db('ingredient_allergens').where('ingredient_id', loserId).update({ ingredient_id: winnerId });
            } catch (err) {
                // Ignore if winner already has that allergen
            }

            // ingredient_substitutions
            await db('ingredient_substitutions').where('ingredient_id', loserId).update({ ingredient_id: winnerId });
            await db('ingredient_substitutions').where('substitute_id', loserId).update({ substitute_id: winnerId });

            // 3. Delete the loser
            await db('ingredients').where('id', loserId).del();
            totalMerged++;
        }
    }

    console.log(`Successfully merged ${totalMerged} duplicate records.`);
    console.log(`Updated ${totalRecipeIngrFixed} recipe_ingredients links.`);

    await db.destroy();
}

runMerge().catch(console.error);
