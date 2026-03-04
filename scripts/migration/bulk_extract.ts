import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const SQL_FILE_PATH = 'C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\Databases\\FoodGenie_test_FULL_DB_1_8_13.sql';
const CSV_FILE_PATH = 'C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\Working Data\\a-z.csv';
const OUTPUT_RECIPES_PATH = path.join(__dirname, '../../data/migration/bulk_recipes.json');
const OUTPUT_INGRS_PATH = path.join(__dirname, '../../data/migration/bulk_ingredients.json');

// Memory map for high-quality CSV parsed data
const sourceDict = new Map<string, any>();

function cleanHtml(html: string): string {
    if (!html || html === 'NULL') return '';
    return html
        .replace(/<[^>]*>?/gm, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#174;/g, '®')
        .replace(/&#176;/g, '°')
        .replace(/&#8482;/g, '™')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)))
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .trim();
}

function parseDirections(html: string): string[] {
    if (!html || html === 'NULL') return [];
    const steps = html.split(/<\/?li[^>]*>/i)
        .map(step => cleanHtml(step))
        .filter(step => step.length > 5 && !step.toLowerCase().includes('directions'));
    return steps;
}

// Regex to extract amount from start of string (e.g., "1/2 cup", "2 cloves", "1 (15 ounce) can")
function heuristicParse(source: string): any {
    const res = { amt: '', unit: '', name: source, prep: '' };

    // Pattern for "1 (15 ounce) can" or "1 1/2 cups"
    // Starts with number, potentially followed by parentheses or fraction
    const amtMatch = source.match(/^([\d\/\s\.-]+(?:\([\d\.\s\w]+\))?)\s+/);
    if (amtMatch) {
        res.amt = amtMatch[1].trim();
        const remainder = source.substring(amtMatch[0].length).trim();

        // Common units
        const units = ['cups?', 'tablespoons?', 'teaspoons?', 'ounces?', 'lbs?', 'pounds?', 'g', 'kg', 'ml', 'cloves?', 'cans?', 'jars?', 'packages?', 'slices?', 'bunches?'];
        const unitRegex = new RegExp(`^(${units.join('|')})\\s+`, 'i');
        const unitMatch = remainder.match(unitRegex);
        if (unitMatch) {
            res.unit = unitMatch[1].trim();
            res.name = remainder.substring(unitMatch[0].length).trim();
        } else {
            res.name = remainder;
        }
    }

    // Check for comma separation for prep (e.g., "Tomato, chopped")
    if (res.name.includes(',')) {
        const commaIdx = res.name.indexOf(',');
        res.prep = res.name.substring(commaIdx + 1).trim();
        res.name = res.name.substring(0, commaIdx).trim();
    }

    return res;
}

async function loadCsvDict() {
    console.log('Loading a-z.csv for parsed reference...');
    const rl = readline.createInterface({
        input: fs.createReadStream(CSV_FILE_PATH),
        crlfDelay: Infinity
    });

    let first = true;
    for await (const line of rl) {
        if (first) { first = false; continue; }
        // regex-less split for performance
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 13) continue;

        const source = parts[12].trim().toLowerCase().replace(/^"|"$/g, '').trim();
        if (!source || sourceDict.has(source)) continue;

        sourceDict.set(source, {
            amt: parts[3].replace(/^"|"$/g, '').trim(),
            unit: parts[4].replace(/^"|"$/g, '').trim(),
            name: parts[7].replace(/^"|"$/g, '').trim(),
            prep: parts[11].replace(/^"|"$/g, '').trim()
        });
    }
    console.log(`Reference dictionary built: ${sourceDict.size} unique lines.`);
}

async function run() {
    await loadCsvDict();

    const recipes: any[] = [];
    const ingrs: any[] = [];

    const rl = readline.createInterface({
        input: fs.createReadStream(SQL_FILE_PATH),
        crlfDelay: Infinity
    });

    let buffer = '';
    for await (const line of rl) {
        if (line.includes('INSERT INTO `temp_recipes` VALUES')) {
            if (buffer) parseAndPush(buffer, recipes, ingrs);
            buffer = line;
        } else if (buffer) {
            buffer += ' ' + line;
            if (line.includes(');')) {
                parseAndPush(buffer, recipes, ingrs);
                buffer = '';
            }
        }
    }
    if (buffer) parseAndPush(buffer, recipes, ingrs);

    console.log(`Extracted: ${recipes.length} recipes, ${ingrs.length} ingrs.`);
    fs.writeFileSync(OUTPUT_RECIPES_PATH, JSON.stringify(recipes, null, 2));
    fs.writeFileSync(OUTPUT_INGRS_PATH, JSON.stringify(ingrs, null, 2));
}

function parseAndPush(stmt: string, recipes: any[], ingrs: any[]) {
    try {
        const startIdx = stmt.indexOf('VALUES(');
        if (startIdx === -1) return;

        let content = stmt.substring(startIdx + 7).trim();
        if (content.endsWith(';')) content = content.slice(0, -1);
        if (content.endsWith(')')) content = content.slice(0, -1);

        const cols = parseSQLFields(content);
        if (cols.length < 9) return;

        const recipeId = parseInt(cols[0]);
        if (isNaN(recipeId)) return;

        recipes.push({
            id: recipeId,
            title: cleanHtml(cols[2]),
            source_url: cols[3].replace(/^"|"$/g, ''),
            image_url: cols[4] === 'NULL' ? null : cols[4].replace(/^"|"$/g, ''),
            directions: parseDirections(cols[8])
        });

        // Parse Ingredients using Dictionary or Heuristic
        const rawIngrHtml = cols[7];
        const items = rawIngrHtml.split(/<\/?li[^>]*>/i);
        for (let item of items) {
            item = cleanHtml(item).trim();
            if (item && item.length > 2 && !item.toLowerCase().includes('ingredients')) {
                const lookup = sourceDict.get(item.toLowerCase());
                if (lookup) {
                    ingrs.push({
                        recipe_id: recipeId,
                        source_line: item,
                        quantity: lookup.amt,
                        unit: lookup.unit,
                        ingr_name: lookup.name,
                        prep_state: lookup.prep
                    });
                } else {
                    const parsed = heuristicParse(item);
                    ingrs.push({
                        recipe_id: recipeId,
                        source_line: item,
                        quantity: parsed.amt,
                        unit: parsed.unit,
                        ingr_name: parsed.name,
                        prep_state: parsed.prep
                    });
                }
            }
        }
    } catch (e) {
        // Skip
    }
}

function parseSQLFields(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inString = false;
    let quoteChar = '';
    let escaped = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if ((char === "'" || char === '"') && !inString) {
            inString = true;
            quoteChar = char;
            continue;
        }
        if (char === quoteChar && inString) {
            if (row[i + 1] === quoteChar) {
                current += quoteChar;
                i++;
            } else {
                inString = false;
                quoteChar = '';
            }
            continue;
        }
        if (char === ',' && !inString) {
            result.push(current.trim() === 'NULL' ? 'NULL' : current);
            current = '';
            continue;
        }
        current += char;
    }
    result.push(current.trim() === 'NULL' ? 'NULL' : current);
    return result;
}

run().catch(console.error);
