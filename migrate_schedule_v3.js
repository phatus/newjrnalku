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

        console.log('Adding implementation_basis_id to activity_schedules...');
        await client.query(`
            ALTER TABLE activity_schedules 
            ADD COLUMN IF NOT EXISTS implementation_basis_id BIGINT REFERENCES implementation_bases(id) ON DELETE SET NULL;
        `);

        console.log('Adding schedule_id to activities...');
        await client.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES activity_schedules(id) ON DELETE SET NULL;
        `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
