const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Creating tables...');

    // Using a more manual approach if RPC is not available or failing
    // Since I can't run raw SQL directly without exec_sql RPC, 
    // I will try to see if I can use the admin client's power or if there's another way.
    // Actually, usually in these environments, exec_sql is the way. 
    // If it's missing, I might have to ask the user to run it in Supabase Dashboard.

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

    ALTER TABLE public.activity_schedules ENABLE ROW LEVEL SECURITY;

    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own schedules') THEN
            CREATE POLICY "Users can manage their own schedules" ON public.activity_schedules
                FOR ALL USING (auth.uid() = user_id);
        END IF;
    END $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error creating tables:', error);
        console.log('\n--- SQL TO RUN MANUALLY ---');
        console.log(sql);
    } else {
        console.log('Tables created successfully!');
    }
}

run();
