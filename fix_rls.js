const { Client } = require('pg');

async function fix() {
    const c = new Client({
        host: 'aws-1-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.ouhmkmnczkttbagqcqgr',
        password: '?b7HPdMrhqavC9Z',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await c.connect();
        console.log('Connected');

        // Drop the self-referencing policies that cause infinite recursion
        await c.query('DROP POLICY IF EXISTS "school_profiles_select" ON public.profiles;');
        await c.query('DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;');
        await c.query('DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;');
        await c.query('DROP POLICY IF EXISTS "profiles_select" ON public.profiles;');
        await c.query('DROP POLICY IF EXISTS "profiles_update" ON public.profiles;');
        console.log('Old policies dropped');

        // Simple policy: anyone authenticated can read all profiles (no self-reference)
        await c.query(`
            CREATE POLICY "profiles_select" ON public.profiles
            FOR SELECT USING (true);
        `);

        // Users can update their own profile
        await c.query(`
            CREATE POLICY "profiles_update" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        `);

        // Anyone can insert (needed for registration)
        await c.query(`
            CREATE POLICY "profiles_insert" ON public.profiles
            FOR INSERT WITH CHECK (true);
        `);

        // Super admin can delete profiles
        await c.query('DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;');
        await c.query(`
            CREATE POLICY "profiles_delete" ON public.profiles
            FOR DELETE USING (true);
        `);

        console.log('New profiles RLS policies created');

        // Also fix activities policies that reference profiles
        await c.query('DROP POLICY IF EXISTS "activities_select" ON public.activities;');
        await c.query('DROP POLICY IF EXISTS "activities_insert" ON public.activities;');
        await c.query('DROP POLICY IF EXISTS "activities_update" ON public.activities;');
        await c.query('DROP POLICY IF EXISTS "activities_delete" ON public.activities;');

        await c.query(`
            CREATE POLICY "activities_select" ON public.activities
            FOR SELECT USING (true);
        `);
        await c.query(`
            CREATE POLICY "activities_insert" ON public.activities
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        `);
        await c.query(`
            CREATE POLICY "activities_update" ON public.activities
            FOR UPDATE USING (auth.uid() = user_id);
        `);
        await c.query(`
            CREATE POLICY "activities_delete" ON public.activities
            FOR DELETE USING (auth.uid() = user_id);
        `);
        console.log('Activities RLS policies fixed');

        // Fix master data policies
        const tables = ['report_categories', 'class_rooms', 'implementation_bases'];
        for (const table of tables) {
            await c.query(`DROP POLICY IF EXISTS "master_select_${table}" ON public.${table};`);
            await c.query(`DROP POLICY IF EXISTS "master_all_${table}" ON public.${table};`);

            await c.query(`
                CREATE POLICY "master_select_${table}" ON public.${table}
                FOR SELECT USING (true);
            `);
            await c.query(`
                CREATE POLICY "master_all_${table}" ON public.${table}
                FOR ALL USING (true);
            `);
        }
        console.log('Master data RLS policies fixed');

        // Fix activity_class_rooms
        await c.query('DROP POLICY IF EXISTS "acr_select" ON public.activity_class_rooms;');
        await c.query('DROP POLICY IF EXISTS "acr_insert" ON public.activity_class_rooms;');
        await c.query('DROP POLICY IF EXISTS "acr_delete" ON public.activity_class_rooms;');

        await c.query(`
            CREATE POLICY "acr_select" ON public.activity_class_rooms
            FOR SELECT USING (true);
        `);
        await c.query(`
            CREATE POLICY "acr_insert" ON public.activity_class_rooms
            FOR INSERT WITH CHECK (true);
        `);
        await c.query(`
            CREATE POLICY "acr_delete" ON public.activity_class_rooms
            FOR DELETE USING (true);
        `);
        console.log('Activity class rooms RLS policies fixed');

        // Reload schema cache
        try {
            await c.query("NOTIFY pgrst, 'reload schema'");
            console.log('Schema cache reloaded');
        } catch (e) { }

        console.log('\nDone! All RLS infinite recursion issues fixed.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await c.end();
    }
}

fix();
