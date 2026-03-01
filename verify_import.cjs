const knex = require('knex');
const config = {
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
const db = knex(config);

async function verify() {
    const rc = await db('recipes').count('* as count');
    const ic = await db('ingredients').count('* as count');
    const ric = await db('recipe_ingredients').count('* as count');
    const rsc = await db('recipe_steps').count('* as count');

    console.log('--- DB Verification ---');
    console.log('Recipes:', rc[0].count);
    console.log('Ingredients:', ic[0].count);
    console.log('Recipe Ingredients (links):', ric[0].count);
    console.log('Recipe Steps:', rsc[0].count);

    const sample = await db('recipes').first();
    console.log('Sample Recipe Title:', sample.title);

    await db.destroy();
}
verify();
