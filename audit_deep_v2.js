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
            SELECT table_name, column_name, data_type, udt_name, numeric_precision
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'id'
            AND table_name IN ('report_categories', 'class_rooms', 'implementation_bases', 'profiles', 'schools')
        `);
        console.log('Detailed Audit:');
        res.rows.forEach(r => {
            console.log(`- ${r.table_name}: ${r.column_name} is ${r.data_type} (${r.udt_name}, prec=${r.numeric_precision})`);
        });

    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

run();
