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
            SELECT table_name, column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'id'
            AND table_name IN ('report_categories', 'class_rooms', 'implementation_bases')
        `);
        console.log('--- Detailed ID Audit ---');
        res.rows.forEach(r => {
            console.log(`${r.table_name}.id: type=${r.data_type}, udt=${r.udt_name}`);
        });

    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

run();
