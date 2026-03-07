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
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('activity_schedules', 'schedule_class_rooms')
        `);
        console.log('Tables found:', res.rows.map(r => r.table_name));

        const cols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activity_schedules'
        `);
        console.log('Columns in activity_schedules:', cols.rows.length);
    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await client.end();
    }
}

run();
