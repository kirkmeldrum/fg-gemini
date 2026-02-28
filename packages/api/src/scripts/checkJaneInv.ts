
import { db } from '../config/database.js';

async function checkJaneInventory() {
    try {
        const userId = 5;
        const items = await db('user_inventory')
            .join('ingredients', 'user_inventory.ingredient_id', 'ingredients.id')
            .where('user_id', userId)
            .select('ingredients.name', 'ingredients.id', 'ingredients.is_pantry_staple');

        console.log('JANE INVENTORY:');
        console.log(JSON.stringify(items, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

checkJaneInventory();
