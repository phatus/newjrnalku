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
        // Check if RLS is enabled and list policies
        const res = await client.query(`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual, 
        with_check 
      FROM pg_policies 
      WHERE tablename IN ('report_categories', 'class_rooms', 'implementation_bases');
    `);
        console.log(JSON.stringify(res.rows, null, 2));

        // Also check if RLS is enabled on these tables
        const rlsStatus = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE relname IN ('report_categories', 'class_rooms', 'implementation_bases')
      AND nspname = 'public';
    `);
        console.log('RLS Status (relrowsecurity=true means enabled):');
        console.log(JSON.stringify(rlsStatus.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
