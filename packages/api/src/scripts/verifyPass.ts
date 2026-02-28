
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function verifyJanePassword() {
    try {
        const user = await db('users').where({ email: 'jane@foodgenie.test' }).first();
        if (!user) {
            console.log('USER NOT FOUND');
            process.exit(1);
        }

        const password = 'Password123!';
        const valid = await bcrypt.compare(password, user.password_hash);
        console.log(`PASSWORD ${password} FOR ${user.email} IS: ${valid ? 'VALID' : 'INVALID'}`);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

verifyJanePassword();
