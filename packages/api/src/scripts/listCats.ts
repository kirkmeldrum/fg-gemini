
import { db } from '../config/database.js';

async function listCats() {
    try {
        const cats = await db('food_categories').select('id', 'name', 'parent_id');
        console.log(JSON.stringify(cats, null, 2));

        const ingredients = await db('ingredients').select('id', 'name', 'category_id');
        console.log(JSON.stringify(ingredients, null, 2));

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

listCats();
