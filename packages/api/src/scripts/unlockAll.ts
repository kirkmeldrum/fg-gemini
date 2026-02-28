
import { db } from '../config/database.js';

async function unlockAll() {
    try {
        await db('users')
            .update({
                failed_login_count: 0,
                locked_until: null
            });

        console.log('UNLOCKED ALL USERS.');
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

unlockAll();
