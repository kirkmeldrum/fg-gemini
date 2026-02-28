
import { db } from '../config/database.js';

async function listUsers() {
    try {
        const users = await db('users').select('id', 'username', 'email', 'role');
        console.log('USERS_START');
        console.log(JSON.stringify(users));
        console.log('USERS_END');
        process.exit(0);
    } catch (err) {
        console.error('Error listing users:', err);
        process.exit(1);
    }
}

listUsers();
