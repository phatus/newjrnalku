const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const client = new Client({
        host: 'aws-1-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.ouhmkmnczkttbagqcqgr',
        password: '?b7HPdMrhqavC9Z',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Add user_id column to master data tables
        const tables = ['report_categories', 'class_rooms', 'implementation_bases'];

        for (const table of tables) {
            console.log(`Migrating table: ${table}`);
            await client.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      `);
            console.log(`Successfully added user_id column to ${table}`);
        }

        // Refresh schema cache (Supabase specific)
        try {
            await client.query('NOTIFY pgrst, "reload schema";');
            console.log('Notified PostgREST to reload schema');
        } catch (e) {
            console.log('Schema reload notification failed (not critical):', e.message);
        }

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

migrate();
