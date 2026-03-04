import knex from 'knex';
import * as fs from 'fs';
import * as path from 'path';

const dbConfig = {
    client: 'mssql',
    connection: {
        host: 'localhost',
        port: 1433,
        user: 'sa',
        password: 'VU6ex?S6ICh',
        database: 'FoodGenieGemini',
        options: {
            enableArithAbort: true,
            trustServerCertificate: true
        }
    }
};

const db = knex(dbConfig);

const IMAGE_DIR = 'C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\images';

async function mapPhotos() {
    console.log('Mapping legacy photo URLs to local paths...');

    const recipes = await db('recipes')
        .select('id', 'image_url')
        .whereNotNull('image_url');

    console.log(`Found ${recipes.length} recipes with legacy URLs.`);

    let updated = 0;
    let missing = 0;

    for (const r of recipes) {
        const url = r.image_url.trim();
        // Extract filename from URL
        // Patterns:
        // http://images.media-allrecipes.com/images/29568.gif
        // http://images.media-allrecipes.com/global/recipes/small/116871.jpg
        // http://images.media-allrecipes.com/userphotos/140x140/00/70/28/702856.jpg

        const parts = url.split('/');
        const filename = parts[parts.length - 1]; // e.g. 702856.jpg

        // Map to GIF to JPG if needed, as most local are .jpg
        // Actually let's check for both.
        let localFilename = filename;
        let localPath = path.join(IMAGE_DIR, localFilename);

        if (!fs.existsSync(localPath)) {
            // Try changing extension to .jpg
            const base = filename.split('.')[0];
            localFilename = `${base}.jpg`;
            localPath = path.join(IMAGE_DIR, localFilename);
        }

        if (fs.existsSync(localPath)) {
            // Update DB with local-friendly public path or just the filename for now
            // We'll store it as 'local://filename' to distinguish
            await db('recipes').where('id', r.id).update({
                image_url: `local://${localFilename}`
            });
            updated++;
        } else {
            missing++;
        }
    }

    console.log(`Successfully mapped ${updated} recipes to local images.`);
    console.log(`${missing} recipes still missing local assets.`);

    await db.destroy();
}

mapPhotos().catch(console.error);
