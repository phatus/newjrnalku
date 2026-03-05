const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
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

        const tables = ['report_categories', 'class_rooms', 'implementation_bases'];

        for (const table of tables) {
            console.log(`Setting policies for ${table}...`);

            // 1. Drop existing policies if they overlap (optional but safer)
            // 2. Add SELECT policy (view public AND own items)
            await client.query(`
            DROP POLICY IF EXISTS "Users can view public items and their own." ON ${table};
            CREATE POLICY "Users can view public items and their own." ON ${table}
            FOR SELECT
            USING (user_id IS NULL OR user_id = auth.uid());
        `);

            // 3. Add INSERT policy (must set user_id to own UID)
            await client.query(`
            DROP POLICY IF EXISTS "Users can insert their own items." ON ${table};
            CREATE POLICY "Users can insert their own items." ON ${table}
            FOR INSERT
            WITH CHECK (user_id = auth.uid());
        `);

            // 4. Add UPDATE policy
            await client.query(`
            DROP POLICY IF EXISTS "Users can update their own items." ON ${table};
            CREATE POLICY "Users can update their own items." ON ${table}
            FOR UPDATE
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
        `);

            // 5. Add DELETE policy
            await client.query(`
            DROP POLICY IF EXISTS "Users can delete their own items." ON ${table};
            CREATE POLICY "Users can delete their own items." ON ${table}
            FOR DELETE
            USING (user_id = auth.uid());
        `);

            console.log(`Policies applied for ${table}`);
        }

        console.log('All migrations completed successfully');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

run();
