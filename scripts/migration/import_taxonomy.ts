import knex from 'knex';
import * as fs from 'fs';
import * as path from 'path';

const getSamplePath = () => {
    const paths = [
        path.join(process.cwd(), 'data', 'migration', 'sample_legacy_data.json'),
        path.join(process.cwd(), '..', '..', 'data', 'migration', 'sample_legacy_data.json'),
        path.join(__dirname, '..', '..', 'data', 'migration', 'sample_legacy_data.json')
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return paths[0];
};

const SAMPLE_DATA_PATH = getSamplePath();

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

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function runImport() {
    console.log('Starting taxonomy import...');

    if (!fs.existsSync(SAMPLE_DATA_PATH)) {
        console.error('Sample data file not found!');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    const { categories, cookingSupplies } = data;

    const modernCategoryIdMap = new Map<string, number>(); // Legacy Path -> Modern ID

    // 1. Process Flat Categories (Packaged Food Categories)
    console.log(`Processing ${categories.length} flat categories...`);
    for (const cat of categories) {
        const name = cat.pf_category_name;
        const slug = slugify(name);

        try {
            let existing = await db('food_categories').where('slug', slug).first();
            let id: number;
            if (!existing) {
                const [res] = await db('food_categories').insert({
                    name,
                    slug,
                    depth: 0,
                    parent_id: null
                }).returning('id');
                id = typeof res === 'object' ? res.id : res;
            } else {
                id = existing.id;
            }
            modernCategoryIdMap.set(`pf-${cat.pf_category_id}`, id);
        } catch (err) {
            console.error(`Error importing category ${name}:`, err);
        }
    }

    // 2. Process Hierarchical Cooking Supplies (Materialized Path)
    console.log(`Processing ${cookingSupplies.length} cooking supplies...`);

    // Sort by path length to ensure parents are created first
    const sortedSupplies = cookingSupplies.sort((a: any, b: any) =>
        a.cooking_materialized_path.split('.').length - b.cooking_materialized_path.split('.').length
    );

    for (const supply of sortedSupplies) {
        const pathParts = supply.cooking_materialized_path.split('.');
        const parentPath = pathParts.slice(0, -1).join('.');
        const name = supply.cooking_name;
        const slug = slugify(name) + (pathParts.length > 1 ? `-${pathParts.join('-')}` : '');
        const depth = pathParts.length - 1;

        try {
            let existing = await db('food_categories').where('slug', slug).first();
            let id: number;

            const parentId = parentPath ? modernCategoryIdMap.get(`cook-${parentPath}`) : null;

            if (!existing) {
                const [res] = await db('food_categories').insert({
                    name,
                    slug,
                    depth,
                    parent_id: parentId || null
                }).returning('id');
                id = typeof res === 'object' ? res.id : res;
            } else {
                id = existing.id;
            }
            modernCategoryIdMap.set(`cook-${supply.cooking_materialized_path}`, id);
        } catch (err) {
            console.error(`Error importing supply ${name}:`, err);
        }
    }

    // 3. Update Ingredients to point to categories if possible
    // Note: We'd need a map of legacy packaged food Category ID -> Modern Category ID
    console.log('Taxonomy import complete!');
    await db.destroy();
}

runImport().catch(console.error);
