const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const UID = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus

    const { data: schedules, error } = await supabase
        .from('activity_schedules')
        .select(`
            *,
            schedule_class_rooms(class_room_id)
        `)
        .eq('user_id', UID);

    if (error) {
        console.error('Error fetching schedules:', error);
        return;
    }

    console.log('Total schedules found for user:', schedules.length);
    schedules.forEach(s => {
        console.log(`- ID: ${s.id}, Day: ${s.day_of_week}, Topic: ${s.topic}`);
    });

    const today = new Date().getDay();
    console.log('Server-side today index (0-6, Sun-Sat):', today);
    const todaySchedules = schedules.filter(s => s.day_of_week === today);
    console.log('Schedules matching today:', todaySchedules.length);
}

run().catch(console.error);
