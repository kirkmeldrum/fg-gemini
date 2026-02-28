
import { db } from '../config/database.js';

async function seedInventory() {
    try {
        const userId = 5; // Jane
        const items = [
            { user_id: userId, ingredient_id: 1, quantity: 500, unit: 'grams', storage_location: 'pantry' }, // Salt
            { user_id: userId, ingredient_id: 2, quantity: 100, unit: 'grams', storage_location: 'pantry' }, // Pepper
            { user_id: userId, ingredient_id: 3, quantity: 1, unit: 'liter', storage_location: 'pantry' },   // Olive Oil
            { user_id: userId, ingredient_id: 5, quantity: 12, unit: 'pieces', storage_location: 'fridge' },  // Eggs
            { user_id: userId, ingredient_id: 6, quantity: 2, unit: 'kg', storage_location: 'pantry' },      // Flour
            { user_id: userId, ingredient_id: 13, quantity: 2, unit: 'lb', storage_location: 'fridge' },    // Chicken
        ];

        // Clear existing inventory for Jane
        await db('user_inventory').where({ user_id: userId }).delete();

        await db('user_inventory').insert(items);

        console.log('✅ Inventory seeded for Jane.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding inventory:', err);
        process.exit(1);
    }
}

seedInventory();
