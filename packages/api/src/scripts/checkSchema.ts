
import { db } from '../config/database.js';

async function run() {
    try {
        const ingredients = await db('ingredients').columnInfo();
        const categories = await db('food_categories').columnInfo();
        const shopping = await db('shopping_list_items').columnInfo();
        const inventory = await db('user_inventory').columnInfo();
        console.log('SHOPPING:', JSON.stringify(shopping, null, 2));
        console.log('INVENTORY:', JSON.stringify(inventory, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
