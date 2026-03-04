import fs from 'fs';
import readline from 'readline';

async function probe() {
    const file = 'C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\Databases\\FoodGenie_test_FULL_DB_1_21_13.sql';
    const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });

    console.log('--- Tables in FULL_DB ---');
    let count = 0;
    for await (const line of rl) {
        if (line.includes('CREATE TABLE `temp_recipes`')) {
            count = 15;
        }
        if (count > 0) {
            console.log(line);
            count--;
        }
    }
}

probe();
