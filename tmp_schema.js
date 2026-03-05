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
        const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('report_categories', 'class_rooms', 'implementation_bases')
      ORDER BY table_name, ordinal_position;
    `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
