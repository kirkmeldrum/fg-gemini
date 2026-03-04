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

function cleanText(text: string): string {
    if (!text) return '';
    return text
        .replace(/<[^>]*>?/gm, '') // Strip remaining HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#174;/g, '®')
        .replace(/&#176;/g, '°')
        .replace(/&#8482;/g, '™')
        .replace(/&nbsp;/g, ' ')
        // Handle numeric entities generic approach
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .trim();
}

async function scrubEntities() {
    console.log('Starting Entity Scrubbing...');

    // 1. Scrub recipe_ingredients
    console.log('Scrubbing recipe_ingredients...');
    const ingredients = await db('recipe_ingredients')
        .where('name_display', 'like', '%&%')
        .orWhere('name_display', 'like', '%<%')
        .orWhere('unit', 'like', '%&%')
        .orWhere('prep_state', 'like', '%&%');

    console.log(`Found ${ingredients.length} ingredients to check.`);
    let ingrCount = 0;
    for (const row of ingredients) {
        const cleanedDisplay = cleanText(row.name_display);
        const cleanedUnit = cleanText(row.unit);
        const cleanedPrep = cleanText(row.prep_state);

        if (cleanedDisplay !== row.name_display || cleanedUnit !== row.unit || cleanedPrep !== row.prep_state) {
            await db('recipe_ingredients')
                .where('id', row.id)
                .update({
                    name_display: cleanedDisplay,
                    unit: cleanedUnit,
                    prep_state: cleanedPrep,
                    updated_at: new Date()
                });
            ingrCount++;
        }
    }
    console.log(`Updated ${ingrCount} recipe_ingredients.`);

    // 2. Scrub recipe_steps
    console.log('Scrubbing recipe_steps...');
    const steps = await db('recipe_steps')
        .where('instruction', 'like', '%&%')
        .orWhere('instruction', 'like', '%<%');

    console.log(`Found ${steps.length} steps to check.`);
    let stepCount = 0;
    for (const row of steps) {
        const cleaned = cleanText(row.instruction);
        if (cleaned !== row.instruction) {
            await db('recipe_steps')
                .where('id', row.id)
                .update({
                    instruction: cleaned,
                    updated_at: new Date()
                });
            stepCount++;
        }
    }
    console.log(`Updated ${stepCount} recipe_steps.`);

    // 3. Scrub recipes (title/description)
    console.log('Scrubbing recipes...');
    const recipes = await db('recipes')
        .where('title', 'like', '%&%')
        .orWhere('description', 'like', '%&%')
        .orWhere('description', 'like', '%<%');

    console.log(`Found ${recipes.length} recipes to check.`);
    let recipeCount = 0;
    for (const row of recipes) {
        const cleanedTitle = cleanText(row.title);
        const cleanedDesc = cleanText(row.description);

        if (cleanedTitle !== row.title || cleanedDesc !== row.description) {
            await db('recipes')
                .where('id', row.id)
                .update({
                    title: cleanedTitle,
                    description: cleanedDesc,
                    updated_at: new Date()
                });
            recipeCount++;
        }
    }
    console.log(`Updated ${recipeCount} recipes.`);

    console.log('\nEntity Scrubbing Complete!');
    await db.destroy();
}

scrubEntities().catch(console.error);
