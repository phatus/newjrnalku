
const { Client } = require('pg');

async function checkProfilesTable() {
    const config = {
        user: 'postgres.ouhmkmnczkttbagqcqgr',
        host: 'aws-1-ap-southeast-1.pooler.supabase.com',
        database: 'postgres',
        password: '?b7HPdMrhqavC9Z',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    };

    const client = new Client(config);
    try {
        await client.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'");
        console.log('Columns in profiles:', res.rows.map(r => r.column_name));

        const settingsRes = await client.query("SELECT * FROM school_settings LIMIT 1");
        console.log('School settings existence:', settingsRes.rows.length > 0 ? 'Yes' : 'No');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkProfilesTable();
