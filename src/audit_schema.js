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

        console.log('--- activities columns ---');
        const res1 = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'activities'
            ORDER BY column_name;
        `);
        res1.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (${r.udt_name})`));

        console.log('--- activity_schedules columns ---');
        const res2 = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'activity_schedules'
            ORDER BY column_name;
        `);
        res2.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (${r.udt_name})`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
