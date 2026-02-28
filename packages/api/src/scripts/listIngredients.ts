
import { db } from '../config/database.js';

async function listIngredients() {
    try {
        const ingredients = await db('ingredients').select('id', 'name', 'slug');
        console.log(JSON.stringify(ingredients, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

listIngredients();
