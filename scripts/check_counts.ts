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

async function check() {
    const rawIngr = await db('ingredients').count('* as count').first();
    const rawRecipes = await db('recipes').count('* as count').first();
    console.log('Ingredients count:', rawIngr?.count);
    console.log('Recipes count:', rawRecipes?.count);
    await db.destroy();
}

check().catch(console.error);
