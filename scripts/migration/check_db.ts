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
    const recipes = await db('recipes').count('id as count');
    const ingredients = await db('ingredients').count('id as count');
    const ri = await db('recipe_ingredients').count('id as count');
    console.log('Recipes:', recipes[0].count);
    console.log('Ingredients:', ingredients[0].count);
    console.log('Recipe Ingredients:', ri[0].count);
    await db.destroy();
}

check().catch(console.error);
