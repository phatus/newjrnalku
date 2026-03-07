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
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'activities'
            ORDER BY column_name;
        `);
        console.log('--- Activities Table Columns ---');
        res.rows.forEach(r => {
            console.log(`${r.column_name}: ${r.data_type}`);
        });
    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

run();
