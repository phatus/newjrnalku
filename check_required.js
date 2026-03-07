const { Client } = require('pg');

async function run() {
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
        const res = await client.query(`
            SELECT column_name, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'activities'
            AND is_nullable = 'NO'
            AND column_default IS NULL
        `);
        console.log('--- REQUIRED COLUMNS IN activities ---');
        res.rows.forEach(r => console.log(r.column_name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
