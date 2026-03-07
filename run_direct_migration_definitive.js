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
        console.log('Connected! Step-by-step migration with DEFINITIVE types...');

        const statements = [
            `DROP TABLE IF EXISTS public.schedule_class_rooms`,
            `DROP TABLE IF EXISTS public.activity_schedules`,
            `CREATE TABLE public.activity_schedules (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                school_id TEXT REFERENCES public.schools(id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES public.report_categories(id),
                implementation_basis_id INTEGER REFERENCES public.implementation_bases(id),
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
                schedule_id UUID REFERENCES public.activity_schedules(id) ON DELETE CASCADE,
                class_room_id INTEGER REFERENCES public.class_rooms(id) ON DELETE CASCADE,
                PRIMARY KEY (schedule_id, class_room_id)
            )`,
            `CREATE INDEX IF NOT EXISTS idx_schedules_user_day ON public.activity_schedules(user_id, day_of_week)`,
            `CREATE INDEX IF NOT EXISTS idx_schedules_school ON public.activity_schedules(school_id)`,
            `ALTER TABLE public.activity_schedules ENABLE ROW LEVEL SECURITY`,
            `CREATE POLICY "Users can manage their own schedules" ON public.activity_schedules
                FOR ALL USING (auth.uid() = user_id)`,
            `CREATE POLICY "Admins can manage school schedules" ON public.activity_schedules
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM profiles 
                        WHERE profiles.id = auth.uid() 
                        AND profiles.school_id = activity_schedules.school_id 
                        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                    )
                )`
        ];

        for (const sql of statements) {
            console.log('Executing:', sql.substring(0, 50).replace(/\n/g, ' ') + '...');
            await client.query(sql);
        }

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
