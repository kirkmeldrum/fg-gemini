
import { db } from '../config/database.js';

async function unlockJane() {
    try {
        const userId = 5; // Jane
        await db('users')
            .where({ id: userId })
            .update({
                failed_login_count: 0,
                locked_until: null
            });

        console.log('UNLOCKED JANE.');
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

unlockJane();
