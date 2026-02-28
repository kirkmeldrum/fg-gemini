// ============================================
// Recipe Import Script (REQ-002.1)
// Imports recipes from CSV into the database.
// ============================================

import fs from 'fs';
import path from 'path';
import { db } from '../config/database.js';
import { generateSlug } from '@foodgenie/shared';

// For large CSV parsing without extra deps, we'll use a basic line-by-line reader
// and a CSV-specific line parser.

interface RecipeRow {
    title: string;
    ingredients: string; // semicolon or comma separated?
    steps: string; // semicolon or pipe separated?
    source_url: string;
    cuisine: string;
    servings: string;
    prep_time: string;
    cook_time: string;
}

// Map the CSV headers to our object
const HEADERS = ['title', 'ingredients', 'steps', 'source_url', 'cuisine', 'servings', 'prep_time', 'cook_time'];

async function importRecipes(csvPath: string) {
    if (!fs.existsSync(csvPath)) {
        console.error(`Error: CSV file not found at ${csvPath}`);
        process.exit(1);
    }

    console.log(`Starting import from: ${csvPath}...`);

    // Read the file line-by-line
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');

    // Assume first line is header
    const data = lines.slice(1);
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < data.length; i++) {
        const line = data[i].trim();
        if (!line) continue;

        // Simple CSV parse (caution with quoted commas)
        // For a more robust solution in production, we'd use 'csv-parse'
        const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));

        if (parts.length < HEADERS.length) {
            console.warn(`Row ${i + 2}: Mismatched columns — skipping.`);
            continue;
        }

        const row: RecipeRow = {
            title: parts[0],
            ingredients: parts[1],
            steps: parts[2],
            source_url: parts[3],
            cuisine: parts[4],
            servings: parts[5],
            prep_time: parts[6],
            cook_time: parts[7]
        };

        try {
            // 1. Generate unique slug (REQ-002.3)
            let slug = generateSlug(row.title);

            // Check for existing slug (idempotency - REQ-002.6)
            const existing = await db('recipes').where({ slug }).first();
            if (existing) {
                // If the recipe already exists with the same title, skip or append a number
                // For this MVP, we'll append a number if it's a DIFFERENT recipe with same title
                // If it's the exact same title at the same source_url, skip (idempotent)
                if (existing.source_url === row.source_url) {
                    skipCount++;
                    continue;
                }
                slug = `${slug}-${Date.now()}`;
            }

            // 2. Insert recipe (REQ-002.1)
            const [recipeId] = await db('recipes').insert({
                title: row.title,
                slug: slug,
                description: `Imported from ${row.source_url}`,
                source_url: row.source_url,
                cuisine: row.cuisine,
                servings: parseInt(row.servings) || 0,
                prep_time: parseInt(row.prep_time) || 0,
                cook_time: parseInt(row.cook_time) || 0,
                privacy: 'public'
            }).returning('id');

            // 3. Simple steps parsing (REQ-002.1)
            // Splitting steps by some delimiter (e.g., '|')
            const steps = row.steps.split('|').map(s => s.trim()).filter(Boolean);
            if (steps.length > 0) {
                const stepInserts = steps.map((s, idx) => ({
                    recipe_id: recipeId.id || recipeId,
                    step_number: idx + 1,
                    instruction: s
                }));
                await db('recipe_steps').insert(stepInserts);
            }

            // 4. Ingredients parsing (REQ-002.1)
            // Note: AI-normalization (REQ-002.2) would be a separate service.
            // For now, we seed raw ingredients as text.
            const rawIngredients = row.ingredients.split(';').map(s => s.trim()).filter(Boolean);
            if (rawIngredients.length > 0) {
                const ingInserts = rawIngredients.map(s => ({
                    recipe_id: recipeId.id || recipeId,
                    name_display: s,
                    ingredient_id: null // Unlinked — for normalization step later
                }));
                await db('recipe_ingredients').insert(ingInserts);
            }

            successCount++;
            if (successCount % 100 === 0) {
                console.log(`Progress: ${successCount} recipes imported...`);
            }

        } catch (err) {
            console.error(`Error on row ${i + 2}:`, err);
        }
    }

    console.log(`--- Import Complete ---`);
    console.log(`Success: ${successCount}`);
    console.log(`Skipped (Duplicated): ${skipCount}`);
}

const csvPath = process.argv[2];
if (!csvPath) {
    console.error('Usage: node importRecipes.js <path-to-csv>');
    process.exit(1);
}

importRecipes(path.resolve(csvPath)).then(() => {
    console.log('Script finished.');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
