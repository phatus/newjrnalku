import pg from 'pg';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function checkUsers() {
    // Manual configuration to bypass URL parsing issues with special characters in password
    const client = new pg.Client({
        user: 'postgres',
        host: 'db.ouhmkmnczkttbagqcqgr.supabase.co',
        database: 'postgres',
        password: '[?b7HPdMrhqavC9Z]',
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Connection Info:', res.rows[0]);
    } catch (err) {
        console.error('Error querying profiles:', err.message);
    } finally {
        await client.end();
    }
}

checkUsers();
