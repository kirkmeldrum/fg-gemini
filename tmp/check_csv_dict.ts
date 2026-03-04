import * as fs from 'fs';
import * as readline from 'readline';

async function buildDict() {
    const rl = readline.createInterface({
        input: fs.createReadStream('C:\\Users\\kirkm\\OneDrive\\FOODGENIE\\Data\\RecipeIndexingScripts\\Working Data\\a-z.csv'),
        crlfDelay: Infinity
    });

    let count = 0;
    const dict = new Map<string, any>();
    let first = true;
    for await (const line of rl) {
        if (first) { first = false; continue; }
        // Very basic CSV split since the specific source uses commas but some fields have quotes
        // A better approach would be a real CSV parser, but for now we'll see if it works for most.
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 13) continue;

        let source = parts[12].trim().toLowerCase().replace(/^"|"$/g, '').trim();
        if (!source) continue;

        if (!dict.has(source)) {
            dict.set(source, {
                amt: parts[3].replace(/^"|"$/g, ''),
                unit: parts[4].replace(/^"|"|"$/g, ''),
                name: parts[7].replace(/^"|"$/g, ''),
                prep: parts[11].replace(/^"|"$/g, '')
            });
        }
        count++;
    }
    console.log(`Unique source lines in CSV: ${dict.size}`);

    // Check some samples
    const samples = Array.from(dict.keys()).slice(0, 10);
    for (const s of samples) {
        console.log(`- ${s}: ${JSON.stringify(dict.get(s))}`);
    }
}

buildDict().catch(console.error);
