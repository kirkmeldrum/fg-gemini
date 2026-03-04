import 'dotenv/config';
import { db } from '../config/database.js';
import axios from 'axios';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';

/**
 * Stage 1: Sample HF Food Data
 * Downloads the first few items from datahiveai/recipes-with-nutrition 
 * to verify schema and mapping potential.
 */
async function sampleHuggingFaceData() {
    console.log('--- Hugging Face Food Data Discovery ---');
    const CSV_URL = 'https://huggingface.co/datasets/datahiveai/recipes-with-nutrition/resolve/main/recipes-with-nutrition.csv';
    const TEMP_FILE = path.join(process.cwd(), 'hf_sample.csv');

    try {
        console.log(`Downloading sample from ${CSV_URL}...`);
        const response = await axios({
            method: 'get',
            url: CSV_URL,
            responseType: 'stream',
            headers: { 'Range': 'bytes=0-2000000' } // Get ~2MB
        });

        const writer = fs.createWriteStream(TEMP_FILE);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('Sample downloaded. Parsing headers and first 10 rows...');

        const parser = fs.createReadStream(TEMP_FILE).pipe(
            parse({
                columns: true,
                skip_empty_lines: true,
                to: 10 // Only first 10 rows
            })
        );

        let matches = 0;
        let index = 0;
        for await (const record of parser) {
            if (index === 0) {
                console.log('Record Keys detected:', Object.keys(record));
            }
            index++;
            console.log(`\nChecking Record: "${record.recipe_name}"`);
            console.log(`URL: ${record.url}`);

            // Try to find in our DB
            const localRecipe = await db('recipes')
                .where('source_url', 'LIKE', `%${(record.url || '').replace('http:', '').replace('https:', '')}%`)
                .orWhere('title', record.recipe_name)
                .first();

            if (localRecipe) {
                console.log(`✅ MATCH FOUND: ID=${localRecipe.id} Title="${localRecipe.title}"`);
                matches++;
            } else {
                console.log(`❌ No match in local library.`);
            }
        }

        console.log(`\nSample check complete. Found ${matches} matches in first 10 rows.`);

    } catch (error: any) {
        console.error('Error during sampling:', error.message);
    } finally {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
        await db.destroy();
    }
}

sampleHuggingFaceData();
