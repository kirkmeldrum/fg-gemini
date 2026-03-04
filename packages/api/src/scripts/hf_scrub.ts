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
        // 0. Preliminary cleanup of messed up characters
        .replace(/┬«/g, '')
        .replace(/Γäó/g, '')
        .replace(/[®™]/g, '')

        // 1. Broadly remove leading measurements in parentheses e.g. (1 1/2 inch)
        .replace(/^\(.*?\)[\s,]*/, '')

        // 2. Remove parentheticals or ones in the middle (handling unclosed)
        .replace(/\s*\(.*?(?:\)|$)/g, '');

    // 3. Loop slightly to catch recursive prefixes like "+ 1 tablespoon + 1 teaspoon"
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

    // 4. Remove trailing artifacts
    clean = clean
        .replace(/,\s+.*$/, '')     // everything after comma
        .replace(/\s+-\s+.*$/, '')  // everything after dash
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

async function runScrub() {
    console.log('Starting High-Fidelity Ingredient Scrubbing...');

    const ingredients = await db('ingredients').select('id', 'name');
    console.log(`Found ${ingredients.length} ingredients to analyze.`);

    let changeCount = 0;
    const collisions = new Map<string, number[]>(); // clean_name -> [ids]

    for (const ingr of ingredients) {
        const cleaned = scrubIngredientLabel(ingr.name);

        if (cleaned !== ingr.name) {
            changeCount++;
            // Update in DB (for now just reporting or doing one by one)
            // Actually, we should probably check for collisions before updating because of the UNIQUE SLUG constraint.
        }

        if (!collisions.has(cleaned)) {
            collisions.set(cleaned, []);
        }
        collisions.get(cleaned)!.push(ingr.id);
    }

    console.log(`Potential changes: ${changeCount}`);

    const actualCollisions = Array.from(collisions.entries()).filter(([name, ids]) => ids.length > 1);
    console.log(`Potential collisions (duplicates after scrub): ${actualCollisions.length}`);

    // If we want to actually APPLY the changes, we need to handle the collisions by merging.
    // For Task 42, we just want to clean the names that DON'T collide.
    // But since many WILL collide (e.g. "onion (yellow or purple)" and "onion"), we must handle them.

    console.log('\nTop 20 Collisions:');
    actualCollisions.slice(0, 20).forEach(([name, ids]) => {
        console.log(`- "${name}": ${ids.length} IDs (${ids.join(', ')})`);
    });

    // Strategy: 
    // 1. Update names that don't cause collisions.
    // 2. For collisions, we need to pick one "winner" and re-point recipe_ingredients.

    console.log('\nApplying non-colliding updates...');
    let updated = 0;
    for (const [name, ids] of collisions) {
        if (ids.length === 1) {
            const id = ids[0];
            const original = ingredients.find(i => i.id === id)!.name;
            if (original !== name && name.length > 0) {
                try {
                    // We also need to update the slug!
                    const newSlug = name.replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                    await db('ingredients').where('id', id).update({
                        name: name,
                        slug: newSlug,
                        updated_at: new Date()
                    });
                    updated++;
                } catch (err) {
                    // Collision on slug?
                }
            }
        }
    }
    console.log(`Updated ${updated} non-colliding ingredients.`);

    await db.destroy();
}

runScrub().catch(console.error);
