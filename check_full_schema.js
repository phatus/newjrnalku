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
            SELECT column_name, is_nullable, column_default, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'activities'
            ORDER BY ordinal_position
        `);
        console.log('--- ACTIVITIES SCHEMA ---');
        res.rows.forEach(r => {
            console.log(`${r.column_name}: nullable=${r.is_nullable}, default=${r.column_default}, type=${r.udt_name}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
