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

        const constraints = [
            { name: 'fk_user', sql: 'ALTER TABLE public.activity_schedules ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE' },
            { name: 'fk_school', sql: 'ALTER TABLE public.activity_schedules ADD CONSTRAINT fk_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE' },
            { name: 'fk_category', sql: 'ALTER TABLE public.activity_schedules ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.report_categories(id)' },
            { name: 'fk_basis', sql: 'ALTER TABLE public.activity_schedules ADD CONSTRAINT fk_basis FOREIGN KEY (implementation_basis_id) REFERENCES public.implementation_bases(id)' },
            { name: 'fk_schedule', sql: 'ALTER TABLE public.schedule_class_rooms ADD CONSTRAINT fk_schedule FOREIGN KEY (schedule_id) REFERENCES public.activity_schedules(id) ON DELETE CASCADE' },
            { name: 'fk_class', sql: 'ALTER TABLE public.schedule_class_rooms ADD CONSTRAINT fk_class FOREIGN KEY (class_room_id) REFERENCES public.class_rooms(id) ON DELETE CASCADE' }
        ];

        for (const c of constraints) {
            try {
                console.log(`Adding ${c.name}...`);
                await client.query(c.sql);
                console.log(`Successfully added ${c.name}`);
            } catch (err) {
                console.error(`Failed to add ${c.name}:`, err.message);
                console.error(`Detail:`, err.detail);
            }
        }

    } catch (err) {
        console.error('Constraint run failed:', err);
    } finally {
        await client.end();
    }
}

run();
