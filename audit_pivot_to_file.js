const { Client } = require('pg');
const fs = require('fs');

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
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'schedule_class_rooms'
        `);
        let output = '--- schedule_class_rooms Columns ---\n';
        res.rows.forEach(r => {
            output += `${r.column_name}: ${r.data_type} (${r.udt_name})\n`;
        });
        fs.writeFileSync('pivot_audit.txt', output);
        console.log('Audit saved to pivot_audit.txt');
    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

run();
