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

        console.log('--- activity_schedules Columns ---');
        const res1 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activity_schedules'
            AND table_schema = 'public';
        `);
        console.table(res1.rows);

        console.log('--- Checking for empty strings in UUID columns ---');
        const res2 = await client.query(`
            SELECT id, user_id, school_id 
            FROM profiles 
            WHERE email = 'agus.widi@gmail.com';
        `);
        console.log('Agus Profile:', res2.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
