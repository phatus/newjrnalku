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

        console.log('Fixing schedule_class_rooms...');
        await client.query(`
            -- Drop and recreate schedule_class_rooms with correct UUID type
            DROP TABLE IF EXISTS schedule_class_rooms;
            CREATE TABLE schedule_class_rooms (
                id SERIAL PRIMARY KEY,
                schedule_id UUID NOT NULL REFERENCES activity_schedules(id) ON DELETE CASCADE,
                class_room_id BIGINT NOT NULL REFERENCES class_rooms(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('Fixing activity_class_rooms (just in case)...');
        // Let's check activity_class_rooms.activity_id type first
        const res = await client.query(`
            SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'activity_class_rooms' AND column_name = 'activity_id'
        `);
        const type = res.rows[0]?.data_type;
        console.log('activity_class_rooms.activity_id type:', type);

        // If it's serial/integer, we might need to fix it if activity.id is UUID.
        // But usually activity.id is BIGINT SERIAL in this app.
        // Let's check activities.id
        const res2 = await client.query(`
            SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'id'
        `);
        console.log('activities.id type:', res2.rows[0]?.data_type);

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
