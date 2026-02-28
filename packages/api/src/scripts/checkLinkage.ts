
import { db } from '../config/database.js';

async function checkLinks() {
    try {
        const stats = await db('recipe_ingredients')
            .select(db.raw('COUNT(*) as total'))
            .select(db.raw('SUM(CASE WHEN ingredient_id IS NOT NULL THEN 1 ELSE 0 END) as linked'))
            .first();

        console.log('RECIPE INGREDIENT LINKS:');
        console.log(JSON.stringify(stats));

        const categories = await db('food_categories').count('* as count').first();
        const ingredients = await db('ingredients').count('* as count').first();

        console.log('TAXONOMY STATS:');
        console.log(JSON.stringify({ categories, ingredients }));

        process.exit(0);
    } catch (err) {
        console.error('Error checking links:', err);
        process.exit(1);
    }
}

checkLinks();
