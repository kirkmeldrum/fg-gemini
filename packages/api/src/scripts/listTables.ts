
import { db } from '../config/database.js';

async function listTables() {
    try {
        const tables = await db.raw("SELECT name FROM sys.tables");
        console.log('TABLES:');
        console.log(JSON.stringify(tables));
        process.exit(0);
    } catch (err) {
        console.error('Error listing tables:', err);
        process.exit(1);
    }
}

listTables();
