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
        console.log('Connected! Creating tables WITHOUT foreign keys for diagnostics...');

        const statements = [
            `DROP TABLE IF EXISTS public.schedule_class_rooms`,
            `DROP TABLE IF EXISTS public.activity_schedules`,
            `CREATE TABLE public.activity_schedules (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID,
                school_id TEXT,
                category_id BIGINT,
                implementation_basis_id BIGINT,
                day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
                topic TEXT,
                description TEXT,
                student_outcome TEXT,
                teaching_hours INTEGER,
                student_count INTEGER,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            `CREATE TABLE public.schedule_class_rooms (
                schedule_id UUID,
                class_room_id BIGINT,
                PRIMARY KEY (schedule_id, class_room_id)
            )`,
            `CREATE INDEX IF NOT EXISTS idx_schedules_user_day ON public.activity_schedules(user_id, day_of_week)`,
            `CREATE INDEX IF NOT EXISTS idx_schedules_school ON public.activity_schedules(school_id)`,
            `ALTER TABLE public.activity_schedules ENABLE ROW LEVEL SECURITY`,
            `CREATE POLICY "Users can manage their own schedules" ON public.activity_schedules
                FOR ALL USING (auth.uid() = user_id)`
        ];

        for (const sql of statements) {
            console.log('Executing:', sql.substring(0, 50).replace(/\n/g, ' ') + '...');
            await client.query(sql);
        }

        console.log('Tables created without FKs. Now running test insert...');

        // Get some real IDs to test
        const profile = await client.query('SELECT id FROM profiles LIMIT 1');
        const school = await client.query('SELECT id FROM schools LIMIT 1');
        const cat = await client.query('SELECT id FROM report_categories LIMIT 1');

        console.log('Profile ID Type:', typeof profile.rows[0]?.id, profile.rows[0]?.id);
        console.log('School ID Type:', typeof school.rows[0]?.id, school.rows[0]?.id);
        console.log('Category ID Type:', typeof cat.rows[0]?.id, cat.rows[0]?.id);

        const testSql = `
            INSERT INTO public.activity_schedules (user_id, school_id, category_id, day_of_week, topic)
            VALUES ($1, $2, $3, 1, 'Test Topic')
            RETURNING id
        `;
        const res = await client.query(testSql, [profile.rows[0]?.id, school.rows[0]?.id, cat.rows[0]?.id]);
        console.log('Test INSERT successful! ID:', res.rows[0].id);

    } catch (err) {
        console.error('Diagnostic run failed:', err);
    } finally {
        await client.end();
    }
}

run();
