const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const client = new Client({
        host: 'aws-1-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.ouhmkmnczkttbagqcqgr',
        password: '?b7HPdMrhqavC9Z',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // ============================================
        // STEP 1: Create "schools" table
        // ============================================
        console.log('\n📦 Step 1: Creating schools table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.schools (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                address TEXT,
                headmaster_name TEXT,
                headmaster_nip TEXT,
                logo_url TEXT,
                invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✅ schools table created');

        // Enable RLS on schools
        await client.query(`ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;`);
        console.log('   ✅ RLS enabled on schools');

        // ============================================
        // STEP 2: Create default school from school_settings
        // ============================================
        console.log('\n📦 Step 2: Creating default school from existing settings...');
        const { rows: settings } = await client.query(`SELECT * FROM public.school_settings LIMIT 1`);

        let defaultSchoolId;
        if (settings.length > 0) {
            const s = settings[0];
            const { rows: inserted } = await client.query(`
                INSERT INTO public.schools (name, address, headmaster_name, headmaster_nip)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
                RETURNING id
            `, [s.school_name, s.school_address, s.headmaster_name, s.headmaster_nip]);

            if (inserted.length > 0) {
                defaultSchoolId = inserted[0].id;
                console.log(`   ✅ Default school created: ${s.school_name} (${defaultSchoolId})`);
            } else {
                // School may already exist from a previous run
                const { rows: existing } = await client.query(`SELECT id FROM public.schools LIMIT 1`);
                defaultSchoolId = existing[0]?.id;
                console.log(`   ⚠️  Using existing school: ${defaultSchoolId}`);
            }
        } else {
            // No school_settings, create a placeholder
            const { rows: inserted } = await client.query(`
                INSERT INTO public.schools (name)
                VALUES ('Sekolah Default')
                RETURNING id
            `);
            defaultSchoolId = inserted[0].id;
            console.log(`   ✅ Placeholder school created: ${defaultSchoolId}`);
        }

        // ============================================
        // STEP 3: Update role CHECK constraint on profiles
        // ============================================
        console.log('\n📦 Step 3: Updating role constraint on profiles...');
        try {
            await client.query(`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;`);
            await client.query(`
                ALTER TABLE public.profiles
                ADD CONSTRAINT profiles_role_check
                CHECK (role IN ('super_admin', 'admin', 'user'));
            `);
            console.log('   ✅ Role constraint updated to include super_admin');
        } catch (e) {
            console.log('   ⚠️  Role constraint update:', e.message);
        }

        // ============================================
        // STEP 4: Add school_id to profiles
        // ============================================
        console.log('\n📦 Step 4: Adding school_id to profiles...');
        await client.query(`
            ALTER TABLE public.profiles
            ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
        `);
        // Set default school for all existing profiles
        await client.query(`UPDATE public.profiles SET school_id = $1 WHERE school_id IS NULL`, [defaultSchoolId]);
        console.log('   ✅ profiles.school_id added and populated');

        // ============================================
        // STEP 5: Add school_id to activities
        // ============================================
        console.log('\n📦 Step 5: Adding school_id to activities...');
        await client.query(`
            ALTER TABLE public.activities
            ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
        `);
        // Set default school for all existing activities
        await client.query(`UPDATE public.activities SET school_id = $1 WHERE school_id IS NULL`, [defaultSchoolId]);
        console.log('   ✅ activities.school_id added and populated');

        // ============================================
        // STEP 6: Add school_id to master data tables (replace user_id)
        // ============================================
        console.log('\n📦 Step 6: Adding school_id to master data tables...');
        const masterTables = ['report_categories', 'class_rooms', 'implementation_bases'];
        for (const table of masterTables) {
            await client.query(`
                ALTER TABLE public.${table}
                ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
            `);
            // Assign existing data to the default school (where school_id is null)
            await client.query(`UPDATE public.${table} SET school_id = $1 WHERE school_id IS NULL`, [defaultSchoolId]);
            console.log(`   ✅ ${table}.school_id added and populated`);
        }

        // ============================================
        // STEP 7: Upgrade current admin to super_admin
        // ============================================
        console.log('\n📦 Step 7: Upgrading admin to super_admin...');
        const { rowCount } = await client.query(`
            UPDATE public.profiles SET role = 'super_admin' WHERE role = 'admin'
        `);
        console.log(`   ✅ ${rowCount} admin(s) upgraded to super_admin`);

        // ============================================
        // STEP 8: Update RLS policies
        // ============================================
        console.log('\n📦 Step 8: Updating RLS policies...');

        // --- Schools ---
        await client.query(`DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;`);
        await client.query(`CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT USING (true);`);
        await client.query(`DROP POLICY IF EXISTS "super_admin can manage schools" ON public.schools;`);
        await client.query(`
            CREATE POLICY "super_admin can manage schools" ON public.schools
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
            );
        `);

        // --- Profiles ---
        await client.query(`DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;`);
        await client.query(`DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;`);
        await client.query(`DROP POLICY IF EXISTS "school_profiles_select" ON public.profiles;`);
        await client.query(`
            CREATE POLICY "school_profiles_select" ON public.profiles
            FOR SELECT USING (
                auth.uid() = id
                OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;`);
        await client.query(`
            CREATE POLICY "profiles_update_own" ON public.profiles
            FOR UPDATE USING (
                auth.uid() = id
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;`);
        await client.query(`
            CREATE POLICY "profiles_insert" ON public.profiles
            FOR INSERT WITH CHECK (true);
        `);

        // --- Activities ---
        await client.query(`DROP POLICY IF EXISTS "Users can view their own activities." ON public.activities;`);
        await client.query(`DROP POLICY IF EXISTS "Users can insert their own activities." ON public.activities;`);
        await client.query(`DROP POLICY IF EXISTS "Users can update their own activities." ON public.activities;`);
        await client.query(`DROP POLICY IF EXISTS "Users can delete their own activities." ON public.activities;`);
        await client.query(`DROP POLICY IF EXISTS "activities_select" ON public.activities;`);
        await client.query(`
            CREATE POLICY "activities_select" ON public.activities
            FOR SELECT USING (
                auth.uid() = user_id
                OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "activities_insert" ON public.activities;`);
        await client.query(`
            CREATE POLICY "activities_insert" ON public.activities
            FOR INSERT WITH CHECK (
                auth.uid() = user_id
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "activities_update" ON public.activities;`);
        await client.query(`
            CREATE POLICY "activities_update" ON public.activities
            FOR UPDATE USING (
                auth.uid() = user_id
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "activities_delete" ON public.activities;`);
        await client.query(`
            CREATE POLICY "activities_delete" ON public.activities
            FOR DELETE USING (
                auth.uid() = user_id
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
            );
        `);

        // --- Master Data (Categories, Classes, Bases) ---
        for (const table of masterTables) {
            await client.query(`DROP POLICY IF EXISTS "Public categories are viewable by everyone." ON public.${table};`);
            await client.query(`DROP POLICY IF EXISTS "Public bases are viewable by everyone." ON public.${table};`);
            await client.query(`DROP POLICY IF EXISTS "Public classes are viewable by everyone." ON public.${table};`);
            await client.query(`DROP POLICY IF EXISTS "master_select_${table}" ON public.${table};`);
            await client.query(`
                CREATE POLICY "master_select_${table}" ON public.${table}
                FOR SELECT USING (
                    school_id IS NULL
                    OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
                    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
                );
            `);
            await client.query(`DROP POLICY IF EXISTS "master_all_${table}" ON public.${table};`);
            await client.query(`
                CREATE POLICY "master_all_${table}" ON public.${table}
                FOR ALL USING (
                    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
                    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
                );
            `);
        }

        // --- Activity Class Rooms ---
        await client.query(`DROP POLICY IF EXISTS "acr_select" ON public.activity_class_rooms;`);
        await client.query(`
            CREATE POLICY "acr_select" ON public.activity_class_rooms
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.activities a
                    WHERE a.id = activity_id
                    AND (
                        a.user_id = auth.uid()
                        OR a.school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
                        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
                    )
                )
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "acr_insert" ON public.activity_class_rooms;`);
        await client.query(`
            CREATE POLICY "acr_insert" ON public.activity_class_rooms
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.activities a
                    WHERE a.id = activity_id AND a.user_id = auth.uid()
                )
            );
        `);
        await client.query(`DROP POLICY IF EXISTS "acr_delete" ON public.activity_class_rooms;`);
        await client.query(`
            CREATE POLICY "acr_delete" ON public.activity_class_rooms
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.activities a
                    WHERE a.id = activity_id AND a.user_id = auth.uid()
                )
            );
        `);

        console.log('   ✅ All RLS policies updated');

        // ============================================
        // STEP 9: Reload schema cache
        // ============================================
        try {
            await client.query('NOTIFY pgrst, \'reload schema\'');
            console.log('\n🔄 Schema cache reloaded');
        } catch (e) {
            console.log('\n⚠️  Schema reload notification:', e.message);
        }

        console.log('\n🎉 Multi-tenant migration completed successfully!');
        console.log(`   Default School ID: ${defaultSchoolId}`);

    } catch (err) {
        console.error('\n❌ Migration error:', err);
    } finally {
        await client.end();
    }
}

migrate();
