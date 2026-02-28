
import fs from 'fs';
import path from 'path';
import { db } from '../config/database.js';

async function seed() {
    try {
        const seedPath = path.resolve('../../database/seeds/v1.1_dev_seed.sql');
        console.log(`Reading seed file from: ${seedPath}`);

        let sql = fs.readFileSync(seedPath, 'utf8');

        // Remove GO commands (specific to T-SQL clients)
        sql = sql.replace(/^GO\s*$/gm, '');

        // Split by semicolon (caution: this is basic and might break on some scripts)
        // But for our specific seed script, it should work if we're careful.
        // Actually, db.raw can often handle multiple statements for SQL Server 
        // if they are not separated by GO.

        console.log('Running seed SQL...');
        await db.raw(sql);

        console.log('✅ Seed successful.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
