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

        console.log('--- activities table ---');
        const res1 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activities';
        `);
        console.table(res1.rows);

        console.log('--- activity_schedules table ---');
        const res2 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activity_schedules';
        `);
        console.table(res2.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
