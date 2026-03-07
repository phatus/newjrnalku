const { Client } = require('pg');

async function migrate() {
    const c = new Client({
        host: 'aws-1-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.ouhmkmnczkttbagqcqgr',
        password: '?b7HPdMrhqavC9Z',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    await c.connect();

    try {
        await c.query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS npsn VARCHAR(8) UNIQUE;`);
        console.log('OK: npsn column added');

        await c.query(`CREATE INDEX IF NOT EXISTS idx_schools_npsn ON schools(npsn);`);
        console.log('OK: npsn index created');
    } catch (e) {
        console.error('ERR:', e.message);
    } finally {
        await c.end();
    }
}

migrate();
