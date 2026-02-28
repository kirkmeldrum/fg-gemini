
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function setupTestUsers() {
    try {
        const passwordHash = await bcrypt.hash('Password123!', 10);

        const users = [
            { username: 'chef_tony', email: 'tony@foodgenie.test', first_name: 'Tony', last_name: 'Chef', password_hash: passwordHash, role: 'user' },
            { username: 'baker_jane', email: 'jane@foodgenie.test', first_name: 'Jane', last_name: 'Baker', password_hash: passwordHash, role: 'user' }
        ];

        for (const user of users) {
            const exists = await db('users').where({ username: user.username }).first();
            if (!exists) {
                await db('users').insert(user);
                console.log(`Created user: ${user.username}`);
            } else {
                await db('users').where({ id: exists.id }).update({ password_hash: user.password_hash });
                console.log(`Updated password for user: ${user.username}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Error setting up test users:', err);
        process.exit(1);
    }
}

setupTestUsers();
