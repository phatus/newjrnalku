const { createClient } = require('@supabase/supabase-js');

async function check() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Checking activity_schedules ---');
    const { data: sData } = await supabase.from('activity_schedules').select('*').limit(1);
    if (sData && sData[0]) {
        console.log('Schedule ID type:', typeof sData[0].id);
        console.log('Schedule sample ID:', sData[0].id);
    } else {
        console.log('No schedules found');
    }

    console.log('--- Checking activities ---');
    const { data: aData } = await supabase.from('activities').select('*').limit(1);
    if (aData && aData[0]) {
        console.log('Activity ID type:', typeof aData[0].id);
        console.log('Activity schedule_id type:', typeof aData[0].schedule_id);
    } else {
        console.log('No activities found');
    }
}

check();
