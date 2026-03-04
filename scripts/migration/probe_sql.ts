import * as fs from 'fs';
import * as readline from 'readline';

const SQL_FILE_PATH = 'C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\Databases\\Temp Tables\\temp_recipes_with_allrecipes.sql';

async function probeSql() {
    const fileStream = fs.createReadStream(SQL_FILE_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let rowCount = 0;
    for await (const line of rl) {
        if (line.includes('INSERT INTO `temp_recipes` VALUES')) {
            console.log('Found INSERT INTO `temp_recipes` VALUES');
            const values = parseInsertValues(line);
            for (const row of values) {
                console.log(`\n--- Row ${rowCount} ---`);
                row.forEach((val, idx) => {
                    const displayVal = val.length > 50 ? val.substring(0, 50) + '...' : val;
                    console.log(`[${idx}] ${displayVal}`);
                });
                rowCount++;
                if (rowCount >= 5) break;
            }
            if (rowCount >= 5) break;
        }
    }
}

function parseInsertValues(line: string): string[][] {
    const startIdx = line.indexOf('VALUES');
    if (startIdx === -1) return [];

    let content = line.substring(startIdx + 6).trim();
    if (content.endsWith(';')) {
        content = content.slice(0, -1);
    }

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

probeSql().catch(console.error);
