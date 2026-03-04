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

async function verify() {
    console.log('--- Verifying Samples ---');

    const sampleRecipes = await db('recipes').orderBy('id', 'asc').limit(5);

    for (const r of sampleRecipes) {
        console.log(`\nRecipe: ${r.title} (ID: ${r.id}, Slug: ${r.slug})`);

        const ingredients = await db('recipe_ingredients')
            .where('recipe_id', r.id)
            .orderBy('sort_order', 'asc');
        console.log(`Ingredients (${ingredients.length}):`);
        ingredients.forEach(i => console.log(`  - ${i.name_display}`));

        const steps = await db('recipe_steps')
            .where('recipe_id', r.id)
            .orderBy('step_number', 'asc');
        console.log(`Steps (${steps.length}):`);
        steps.forEach(s => console.log(`  ${s.step_number}. ${s.instruction.substring(0, 50)}...`));
    }

    await db.destroy();
}

verify().catch(console.error);
