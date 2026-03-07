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
        const tables = ['schools', 'profiles', 'report_categories', 'class_rooms', 'implementation_bases'];
        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'id' 
            AND table_name = ANY($1)
        `, [tables]);
        console.log('--- ID Column Types ---');
        res.rows.forEach(r => console.log(`${r.table_name}.id: ${r.data_type}`));

        const res2 = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'report_categories'
            AND column_name IN ('school_id', 'user_id')
        `);
        console.log('\n--- FK Types in report_categories ---');
        res2.rows.forEach(r => console.log(`${r.table_name}.${r.column_name}: ${r.data_type}`));

    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

run();
