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

        console.log('--- TARGET COLS ---');
        const res = await client.query(`
            SELECT table_name, column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND (
                (table_name = 'activity_schedules' AND column_name = 'id') OR
                (table_name = 'schedule_class_rooms' AND column_name = 'schedule_id') OR
                (table_name = 'activities' AND column_name = 'schedule_id')
            )
            ORDER BY table_name, column_name;
        `);
        res.rows.forEach(r => {
            console.log(`${r.table_name}.${r.column_name}: ${r.data_type} (${r.udt_name})`);
        });

        console.log('\n--- schedule_class_rooms SAMPLE ---');
        const res2 = await client.query(`SELECT * FROM schedule_class_rooms LIMIT 5;`);
        console.log(JSON.stringify(res2.rows, null, 2));

        console.log('\n--- activity_schedules SAMPLE ---');
        const res3 = await client.query(`SELECT id, topic FROM activity_schedules LIMIT 5;`);
        console.log(JSON.stringify(res3.rows, null, 2));

    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

run();
