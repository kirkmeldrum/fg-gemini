
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

async function checkRecipes() {
    try {
        const result = await db('recipes').limit(1).select('*');
        console.log('Columns in recipes:', Object.keys(result[0] || []));

        const count = await db('recipes').count('* as count');
        console.log('Total Recipes in DB:', count[0].count);

    } catch (err) {
        console.error('Error checking recipes:', err);
    } finally {
        await db.destroy();
    }
}

checkRecipes();
