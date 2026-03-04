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

async function updatePaths() {
    console.log('Updating Materialized Paths for food_categories...');

    const categories = await db('food_categories').select('id', 'name', 'parent_id');

    async function getPath(catId: number): Promise<string> {
        const cat = categories.find(c => c.id === catId);
        if (!cat) return '';
        if (cat.parent_id === null) return `${catId}`;
        const parentPath = await getPath(cat.parent_id);
        return `${parentPath}.${catId}`;
    }

    let updated = 0;
    for (const cat of categories) {
        const path = await getPath(cat.id);
        await db('food_categories').where('id', cat.id).update({ path });
        updated++;
    }

    console.log(`Updated paths for ${updated} categories.`);
    await db.destroy();
}

updatePaths().catch(console.error);
