const { createClient } = require('@supabase/supabase-js');

async function check() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Checking User ---');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === 'agus.widi@gmail.com');
    if (!user) {
        console.log('User agus.widi@gmail.com not found');
        return;
    }
    console.log('User ID:', user.id);

    console.log('--- Checking Profile ---');
    const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (pError) console.error('Profile error:', pError);
    console.log('Profile school_id:', JSON.stringify(profile?.school_id));

    console.log('--- Checking activity_schedules Schema ---');
    const { data: cols, error: cError } = await supabase.rpc('get_table_columns', { table_name: 'activity_schedules' });
    if (cError) {
        // Fallback to simple query if RPC missing
        const { data: fallback } = await supabase.from('activity_schedules').select('*').limit(1);
        console.log('Sample Schedule keys:', fallback ? Object.keys(fallback[0]) : 'None');
    } else {
        console.log('Cols:', cols);
    }
}

check();
