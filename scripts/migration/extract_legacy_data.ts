import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const SQL_FILE_PATH = 'C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\Databases\\FoodGenie_test_FULL_DB_1_8_13.sql';
const OUTPUT_FILE_PATH = path.join(process.cwd(), 'data', 'migration', 'sample_legacy_data.json');

interface LegacyRecipe {
    recipe_id: number;
    user_id: number;
    recipe_name: string;
    recipe_photo: string;
    recipe_video_url: string;
    recipe_difficulty: string;
    recipe_preparation_time: string;
    recipe_preparation_time_unit: string;
    recipe_cooking_time: string;
    recipe_cooking_time_unit: string;
    recipe_tips: string;
    recipe_preparation_steps: string;
    site_url: string;
    external_url: string;
}

interface LegacyIngredient {
    id: number;
    recipe_id: number;
    ingr_amount: string;
    ingr_measurement: string;
    ingr_preparation: string;
    ingr_id: number;
}

interface LegacyPackagedFood {
    pf_id: number;
    pf_brand: string;
    pf_description: string;
    pf_name: string;
    pf_materialized_path: string;
    pf_category_id: number;
    site_url: string;
}

interface LegacyCategory {
    pf_category_id: number;
    pf_category_name: string;
}

interface LegacyCookingSupply {
    cooking_id: number;
    cooking_name: string;
    cooking_parent_id: number;
    cooking_materialized_path: string;
    site_url: string;
}

async function extractLegacyData() {
    console.log('Starting legacy data extraction...');

    const recipes: LegacyRecipe[] = [];
    const recipeIngredients: LegacyIngredient[] = [];
    const packagedFoods: Map<number, LegacyPackagedFood> = new Map();
    const categories: LegacyCategory[] = [];
    const cookingSupplies: LegacyCookingSupply[] = [];

    const fileStream = fs.createReadStream(SQL_FILE_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentTable = '';
    const recipeIds = new Set<number>();

    for await (const line of rl) {
        if (line.includes('INSERT INTO `rs_recipes` VALUES')) {
            const values = parseInsertValues(line);
            for (const row of values) {

                // Based on schema view: 
                // recipe_id(0), user_id(1), recipe_name(2), image(3), recipe_photo(4), recipe_video_url(5), 
                // recipe_difficulty(6), recipe_preparation_time(7), recipe_preparation_time_unit(8), 
                // recipe_cooking_time(9), recipe_cooking_time_unit(10), recipe_shelf_time(11), 
                // recipe_shelf_time_unit(12), recipe_tips(13), recipe_sides(14), created_on(15), 
                // created_by(16), updated_on(17), updated_by(18), recipe_privacy(19), 
                // recipe_preparation_steps(20), total_votes(21), total_value(22), rated_value(23), 
                // used_ips(24), status(25), recipe_notes(26), recipe_storage_pantry(27), 
                // recipe_storage_fridge(28), recipe_storage_freezer(29), recipe_storage_spicerack(30), 
                // recipe_storage_other(31), recipe_storage_other_description(32), site_url(33), 
                // how_added(34), external_url(35), vendor_id(36)

                const recipe: LegacyRecipe = {
                    recipe_id: parseInt(row[0]),
                    user_id: parseInt(row[1]),
                    recipe_name: row[2],
                    recipe_photo: row[4],
                    recipe_video_url: row[5],
                    recipe_difficulty: row[6],
                    recipe_preparation_time: row[7],
                    recipe_preparation_time_unit: row[8],
                    recipe_cooking_time: row[9],
                    recipe_cooking_time_unit: row[10],
                    recipe_tips: row[13],
                    recipe_preparation_steps: row[20],
                    site_url: row[33],
                    external_url: row[35]
                };
                recipes.push(recipe);
                recipeIds.add(recipe.recipe_id);
            }
        } else if (line.includes('INSERT INTO `rs_recipe_ingredient` VALUES')) {
            const values = parseInsertValues(line);
            for (const row of values) {
                // schema: id(0), recipe_id(1), section_id(2), sort(3), ingr_amount(4), 
                // ingr_measurement(5), ingr_preparation(6), ingr_id(7), ingr_parentId(8)
                const rid = parseInt(row[1]);
                if (recipeIds.has(rid)) {
                    recipeIngredients.push({
                        id: parseInt(row[0]),
                        recipe_id: rid,
                        ingr_amount: row[4],
                        ingr_measurement: row[5],
                        ingr_preparation: row[6],
                        ingr_id: parseInt(row[7])
                    });
                }
            }
        } else if (line.includes('INSERT INTO `rs_packaged_food` VALUES')) {
            const values = parseInsertValues(line);
            for (const row of values) {
                // schema: pf_id(0), pf_brand(1), pf_description(2), pf_name(3), pf_photo(4), ...
                // pf_materialized_path(27), site_url(37)
                const pf_id = parseInt(row[0]);
                packagedFoods.set(pf_id, {
                    pf_id,
                    pf_brand: row[1],
                    pf_description: row[2],
                    pf_name: row[3],
                    pf_category_id: parseInt(row[26]) || 0,
                    pf_materialized_path: row[28],
                    site_url: row[37]
                });
            }
        } else if (line.includes('INSERT INTO `rs_pf_category` VALUES')) {
            const values = parseInsertValues(line);
            for (const row of values) {
                categories.push({
                    pf_category_id: parseInt(row[0]),
                    pf_category_name: row[1]
                });
            }
        } else if (line.includes('INSERT INTO `rs_cooking_supplies` VALUES')) {
            const values = parseInsertValues(line);
            for (const row of values) {
                cookingSupplies.push({
                    cooking_id: parseInt(row[0]),
                    cooking_name: row[3],
                    cooking_parent_id: parseInt(row[21]),
                    cooking_materialized_path: row[22],
                    site_url: row[23]
                });
            }
        }
    }

    // Use all packaged foods, not just those used in sample recipes
    const allPackagedFoods = Array.from(packagedFoods.values());

    const finalData = {
        recipes,
        recipeIngredients,
        packagedFoods: allPackagedFoods,
        categories,
        cookingSupplies
    };

    fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(finalData, null, 2));
    console.log(`Extraction complete!`);
    console.log(`Recipes: ${recipes.length}`);
    console.log(`Recipe Ingredients: ${recipeIngredients.length}`);
    console.log(`Packaged Foods: ${allPackagedFoods.length}`);
    console.log(`Results saved to: ${OUTPUT_FILE_PATH}`);
}

/**
 * Simple parser for SQL INSERT VALUES strings
 * Handles escaped quotes and commas within strings
 */
function parseInsertValues(line: string): string[][] {
    const startIdx = line.indexOf('VALUES');
    if (startIdx === -1) return [];

    // Extract everything after VALUES and trim trailing semicolon
    let content = line.substring(startIdx + 6).trim();
    if (content.endsWith(';')) {
        content = content.slice(0, -1);
    }

    // Split by row tuples: (v1, v2), (v3, v4)
    // This is naive and will fail if strings contain "), ("
    // But for most MySQL dumps it works or can be refined.
    const rows: string[][] = [];
    let currentPos = 0;

    while (currentPos < content.length) {
        const startBracket = content.indexOf('(', currentPos);
        if (startBracket === -1) break;

        let endBracket = -1;
        let inString = false;
        let escaped = false;

        for (let i = startBracket + 1; i < content.length; i++) {
            const char = content[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === "'") {
                inString = !inString;
                continue;
            }
            if (char === ')' && !inString) {
                endBracket = i;
                break;
            }
        }

        if (endBracket === -1) break;

        const rowContent = content.substring(startBracket + 1, endBracket);
        rows.push(parseSQLRow(rowContent));
        currentPos = endBracket + 1;
    }

    return rows;
}

function parseSQLRow(row: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (escaped) {
            currentField += char;
            escaped = false;
            continue;
        }
        if (char === '\\') {
            const nextChar = row[i + 1];
            if (nextChar === 'n') {
                currentField += '\n';
                i++;
            } else if (nextChar === 't') {
                currentField += '\t';
                i++;
            } else if (nextChar === 'r') {
                currentField += '\r';
                i++;
            } else {
                escaped = true;
            }
            continue;
        }
        if (char === "'") {
            inString = !inString;
            continue;
        }
        if (char === ',' && !inString) {
            result.push(currentField.trim().replace(/^'|'$/g, ''));
            currentField = '';
            continue;
        }
        currentField += char;
    }
    result.push(currentField.trim().replace(/^'|'$/g, ''));
    return result;
}

extractLegacyData().catch(console.error);
