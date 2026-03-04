import 'dotenv/config';
import { db } from '../config/database.js';
import axios from 'axios';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';

/**
 * Stage 2: Hugging Face Recipe Enrichment
 * Matches local recipes with the datahiveai/recipes-with-nutrition dataset.
 * Populates calorie and macronutrient data into the recipe_nutrition table.
 */
async function enrichFromHuggingFace() {
    console.log('=== FoodGenie HF Enrichment Engine ===');
    const CSV_URL = 'https://huggingface.co/datasets/datahiveai/recipes-with-nutrition/resolve/main/recipes-with-nutrition.csv';
    const LOCAL_DATA_PATH = path.join(process.cwd(), 'hf_recipes_full.csv');

    // 1. Ensure file is downloaded
    if (!fs.existsSync(LOCAL_DATA_PATH)) {
        console.log(`Downloading full dataset from Hugging Face...`);
        try {
            const response = await axios({
                method: 'get',
                url: CSV_URL,
                responseType: 'stream',
            });
            const writer = fs.createWriteStream(LOCAL_DATA_PATH);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log('✅ Download complete.');
        } catch (error: any) {
            console.error('❌ Download failed:', error.message);
            return;
        }
    }

    // 2. Load Local Recipes into Memory (for speed)
    console.log('Loading local recipes into cache...');
    const recipes = await db('recipes').select('id', 'title', 'source_url');
    const titleMap = new Map();
    const urlMap = new Map();

    for (const r of recipes) {
        if (r.title) titleMap.set(r.title.toLowerCase(), r.id);
        if (r.source_url) {
            const clean = r.source_url.replace('http:', '').replace('https:', '').replace(/\/$/, '');
            urlMap.set(clean, r.id);
        }
    }
    console.log(`✅ Cached ${recipes.length} local recipes.`);

    // 3. Stream and Match
    let processed = 0;
    let matches = 0;
    let updates = 0;
    const batchSize = 100;
    let batch: any[] = [];

    const parser = fs.createReadStream(LOCAL_DATA_PATH).pipe(
        parse({
            columns: true,
            skip_empty_lines: true,
            relax_quotes: true
        })
    );

    console.log('Processing matches...');

    for await (const record of parser) {
        processed++;
        if (processed % 5000 === 0) console.log(`Processed ${processed} source records...`);

        const cleanUrl = (record.url || '').replace('http:', '').replace('https:', '').replace(/\/$/, '');
        const titleKey = (record.recipe_name || '').toLowerCase();

        // Find local recipe ID (URL match is stronger than Title match)
        const localId = urlMap.get(cleanUrl) || titleMap.get(titleKey);

        if (localId) {
            matches++;

            // Parse nutrition JSON
            try {
                let nutrients: any = {};
                // The CSV stores JSON with escaped quotes or single quotes usually
                const rawNutrients = record.total_nutrients ? record.total_nutrients.replace(/'/g, '"') : '{}';
                nutrients = JSON.parse(rawNutrients);

                const nutritionData = {
                    recipe_id: localId,
                    calories: parseFloat(record.calories) || null,
                    fat: nutrients.FAT?.quantity || null,
                    carbs: nutrients.CHOCDF?.quantity || null,
                    protein: nutrients.PROCNT?.quantity || null
                };

                batch.push(nutritionData);

                if (batch.length >= batchSize) {
                    await syncNutritionBatch(batch);
                    updates += batch.length;
                    batch = [];
                }
            } catch (err) {
                // Silently skip corrupted JSON
            }
        }
    }

    // Final batch
    if (batch.length > 0) {
        await syncNutritionBatch(batch);
        updates += batch.length;
    }

    console.log(`\n=== FINISHED ===`);
    console.log(`Source Records: ${processed}`);
    console.log(`Potential Matches: ${matches}`);
    console.log(`Successful Updates: ${updates}`);

    await db.destroy();
}

/**
 * Upserts nutrition data into the DB
 */
async function syncNutritionBatch(batch: any[]) {
    await db.transaction(async (trx) => {
        for (const item of batch) {
            const existing = await trx('recipe_nutrition').where('recipe_id', item.recipe_id).first();
            if (existing) {
                await trx('recipe_nutrition').where('id', existing.id).update(item);
            } else {
                await trx('recipe_nutrition').insert(item);
            }
        }
    });
}

enrichFromHuggingFace();
