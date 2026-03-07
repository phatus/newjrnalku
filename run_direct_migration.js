const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Use the credentials from dev-mcp/.env which has the direct DB password
const devMcpEnv = path.resolve(__dirname, '../dev-mcp/.env');
dotenv.config({ path: devMcpEnv });

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL not found in dev-mcp/.env');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('Connected! Running migration...');

        const sql = `
        CREATE TABLE IF NOT EXISTS public.activity_schedules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
            category_id UUID REFERENCES public.report_categories(id),
            implementation_basis_id UUID REFERENCES public.implementation_bases(id),
            day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
            topic TEXT,
            description TEXT,
            student_outcome TEXT,
            teaching_hours INTEGER,
            student_count INTEGER,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.schedule_class_rooms (
            schedule_id UUID REFERENCES public.activity_schedules(id) ON DELETE CASCADE,
            class_room_id INTEGER REFERENCES public.class_rooms(id) ON DELETE CASCADE,
            PRIMARY KEY (schedule_id, class_room_id)
        );

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS idx_schedules_user_day ON public.activity_schedules(user_id, day_of_week);
        CREATE INDEX IF NOT EXISTS idx_schedules_school ON public.activity_schedules(school_id);

        -- Enable RLS
        ALTER TABLE public.activity_schedules ENABLE ROW LEVEL SECURITY;

        -- Policies
        DROP POLICY IF EXISTS "Users can manage their own schedules" ON public.activity_schedules;
        CREATE POLICY "Users can manage their own schedules" ON public.activity_schedules
            FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Admins can manage school schedules" ON public.activity_schedules;
        CREATE POLICY "Admins can manage school schedules" ON public.activity_schedules
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.school_id = activity_schedules.school_id 
                    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
                )
            );
        `;

        await client.query(sql);
        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
