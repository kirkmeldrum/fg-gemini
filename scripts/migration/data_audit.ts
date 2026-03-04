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

async function runAudit() {
    console.log('=== Data Quality Audit: Legacy Import ===\n');

    // 1. Check for recipes with NO ingredients
    const noIngredients = await db('recipes')
        .leftJoin('recipe_ingredients', 'recipes.id', 'recipe_ingredients.recipe_id')
        .whereNull('recipe_ingredients.id')
        .count('recipes.id as count');
    console.log(`Recipes with 0 ingredients: ${noIngredients[0].count}`);

    // 2. Check for recipes with NO steps
    const noSteps = await db('recipes')
        .leftJoin('recipe_steps', 'recipes.id', 'recipe_steps.recipe_id')
        .whereNull('recipe_steps.id')
        .count('recipes.id as count');
    console.log(`Recipes with 0 steps: ${noSteps[0].count}`);

    // 3. Check for ingredients with unparsed display names (containing HTML or weird chars)
    const weirdIngredients = await db('recipe_ingredients')
        .where('name_display', 'like', '%<%')
        .orWhere('name_display', 'like', '%&%')
        .count('id as count');
    console.log(`Ingredients with potential HTML/Entities: ${weirdIngredients[0].count}`);

    // 4. Check for ingredients NOT linked to the canonical table
    const unlinkedIngredients = await db('recipe_ingredients')
        .whereNull('ingredient_id')
        .count('id as count');
    console.log(`Recipe ingredients NOT linked to canonical table: ${unlinkedIngredients[0].count}`);

    // 5. Sample check: Random high-ID recipes to look for truncation or parsing errors
    console.log('\n--- Sampling High-ID Recipes (40000+) ---');
    const highSamples = await db('recipes').where('id', '>', 40000).limit(3);
    for (const r of highSamples) {
        const stepCount = await db('recipe_steps').where('recipe_id', r.id).count('id as count');
        const ingrCount = await db('recipe_ingredients').where('recipe_id', r.id).count('id as count');
        console.log(`ID: ${r.id} | Title: ${r.title.substring(0, 30)}... | Steps: ${stepCount[0].count} | Ingr: ${ingrCount[0].count}`);
    }

    // 6. Check for duplicate slugs
    const duplicateSlugs = await db('recipes')
        .select('slug')
        .count('id as count')
        .groupBy('slug')
        .havingRaw('COUNT(id) > 1');
    console.log(`\nDuplicate recipe slugs: ${duplicateSlugs.length}`);

    await db.destroy();
}

runAudit().catch(console.error);
