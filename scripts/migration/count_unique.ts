import * as fs from 'fs';
import * as path from 'path';

const INGREDIENTS_PATH = path.join(process.cwd(), 'data', 'migration', 'bulk_ingredients.json');

function run() {
    const data = JSON.parse(fs.readFileSync(INGREDIENTS_PATH, 'utf8'));
    const uniqueNames = new Set<string>();
    data.forEach((i: any) => {
        if (i.ingr_name) uniqueNames.add(i.ingr_name.toLowerCase().trim());
    });
    console.log(`Total ingredient rows: ${data.length}`);
    console.log(`Unique ingredient names: ${uniqueNames.size}`);
}

run();
