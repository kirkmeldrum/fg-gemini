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

function cleanText(text: string): string {
    if (!text || text === 'NULL') return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#174;/g, '®')
        .replace(/&#176;/g, '°')
        .replace(/&#8482;/g, '™')
        .trim();
}

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

function parseQuantity(val: string): number {
    if (!val) return 0;
    val = val.trim();
    if (val.includes(' ')) {
        const parts = val.split(' ');
        return parseFloat(parts[0]) + parseQuantity(parts.slice(1).join(' '));
    }
    if (val.includes('/')) {
        const parts = val.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(val) || 0;
}

function normalizeTime(val: string, unit: string): number {
    const time = parseFloat(val) || 0;
    const u = unit.toLowerCase();
    if (u === '1' || u === 'hour' || u === 'hr' || u === 'hours') return time * 60;
    return time; // Default or '2'/'min' is minutes
}

async function runImport() {
    console.log('Starting trial import...');

    if (!fs.existsSync(SAMPLE_DATA_PATH)) {
        console.error('Sample data file not found!');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(SAMPLE_DATA_PATH, 'utf8'));
    const { recipes, recipeIngredients, packagedFoods } = data;

    console.log(`Processing ${packagedFoods.length} ingredients...`);
    const ingredientIdMap = new Map<number, number>(); // Legacy ID -> Modern ID

    for (const pf of packagedFoods) {
        const name = cleanText(pf.pf_name);
        const brand = cleanText(pf.pf_brand);
        const fullName = brand ? `${brand} ${name}` : name;
        const slug = slugify(fullName) || `ingr-${pf.pf_id}`;

        try {
            // Check if exists
            let existing = await db('ingredients').where('slug', slug).first();
            if (!existing) {
                const [id] = await db('ingredients').insert({
                    name: fullName,
                    slug: slug,
                    description: cleanText(pf.pf_description),
                    is_common: 0
                }).returning('id');
                ingredientIdMap.set(pf.pf_id, typeof id === 'object' ? id.id : id);
            } else {
                ingredientIdMap.set(pf.pf_id, existing.id);
            }
        } catch (err) {
            console.error(`Error importing ingredient ${pf.pf_id}:`, err);
        }
    }

    console.log(`Processing ${recipes.length} recipes...`);
    for (const lr of recipes) {
        const title = cleanText(lr.recipe_name);
        const slug = slugify(title) || `recipe-${lr.recipe_id}`;

        try {
            // Check if exists
            let existing = await db('recipes').where('slug', slug).first();
            let modernRecipeId: number;

            if (!existing) {
                const prepTime = normalizeTime(lr.recipe_preparation_time, lr.recipe_preparation_time_unit);
                const cookTime = normalizeTime(lr.recipe_cooking_time, lr.recipe_cooking_time_unit);

                const [res] = await db('recipes').insert({
                    title: title,
                    slug: slug,
                    description: cleanText(lr.recipe_tips),
                    image_url: lr.recipe_photo !== 'NULL' ? lr.recipe_photo : null,
                    source_url: lr.external_url !== 'NULL' ? lr.external_url : lr.site_url,
                    prep_time: Math.round(prepTime),
                    cook_time: Math.round(cookTime),
                    privacy: 'public'
                }).returning('id');
                modernRecipeId = typeof res === 'object' ? res.id : res;
            } else {
                modernRecipeId = existing.id;
                // Delete existing ingredients/steps for full refresh in trial
                await db('recipe_ingredients').where('recipe_id', modernRecipeId).del();
                await db('recipe_steps').where('recipe_id', modernRecipeId).del();
            }

            // Import ingredients for this recipe
            const ingredients = recipeIngredients.filter((ri: any) => ri.recipe_id === lr.recipe_id);
            for (let i = 0; i < ingredients.length; i++) {
                const ri = ingredients[i];
                const modernIngrId = ingredientIdMap.get(ri.ingr_id);

                await db('recipe_ingredients').insert({
                    recipe_id: modernRecipeId,
                    ingredient_id: modernIngrId || null,
                    name_display: cleanText(ri.ingr_preparation ? `${ri.ingr_amount} ${ri.ingr_measurement} ${ri.ingr_preparation}` : `${ri.ingr_amount} ${ri.ingr_measurement}`),
                    quantity: parseQuantity(ri.ingr_amount),
                    unit: cleanText(ri.ingr_measurement),
                    prep_state: cleanText(ri.ingr_preparation),
                    sort_order: i
                });
            }

            // Import steps
            const steps = lr.recipe_preparation_steps.split('\n').map((s: string) => cleanText(s)).filter((s: string) => s.length > 5);
            for (let i = 0; i < steps.length; i++) {
                await db('recipe_steps').insert({
                    recipe_id: modernRecipeId,
                    step_number: i + 1,
                    instruction: steps[i]
                });
            }

        } catch (err) {
            console.error(`Error importing recipe ${lr.recipe_id}:`, err);
        }
    }

    console.log('Import complete!');
    await db.destroy();
}

runImport().catch(console.error);
