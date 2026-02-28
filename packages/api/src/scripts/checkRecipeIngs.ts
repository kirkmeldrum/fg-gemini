
import { db } from '../config/database.js';

async function checkRecipeIngs() {
    try {
        const ingredients = await db('recipe_ingredients')
            .join('ingredients', 'recipe_ingredients.ingredient_id', 'ingredients.id')
            .select('recipe_ingredients.*', 'ingredients.name as term');
        console.log(JSON.stringify(ingredients, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

checkRecipeIngs();
