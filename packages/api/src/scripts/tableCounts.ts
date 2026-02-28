
import { db } from '../config/database.js';

async function tableCounts() {
    try {
        const tables = await db.raw("SELECT name FROM sys.tables");
        const results = [];
        for (const t of tables) {
            const count = await db(t.name).count('* as c').first();
            results.push({ table: t.name, count: count.c });
        }
        console.log('COUNTS:');
        console.table(results);
        process.exit(0);
    } catch (err) {
        console.error('Error counting rows:', err);
        process.exit(1);
    }
}

tableCounts();
