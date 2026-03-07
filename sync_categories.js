const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const UID = 'b56d8671-d6d7-400d-8547-49608cad17a3';

    // 1. Get Profile
    const { data: profile } = await supabase.from('profiles').select('school_id, name').eq('id', UID).single();
    console.log('User Profile:', JSON.stringify(profile, null, 2));

    const SID = profile.school_id;

    // 2. Get Categories
    const { data: cats } = await supabase.from('report_categories').select('id, name').eq('school_id', SID);
    console.log('Categories for SID ' + SID + ':', JSON.stringify(cats, null, 2));

    // 3. Check for the new ones
    const routineNames = ['Upacara / Apel', 'Piket Mingguan', 'Pembiasaan Pagi'];
    for (const name of routineNames) {
        if (!cats.some(c => c.name === name)) {
            console.log('Missing: ' + name + '. Adding it...');
            await supabase.from('report_categories').insert({
                name: name,
                rhk_label: name === 'Piket Mingguan' ? 'Tugas Tambahan' : 'Budaya Sekolah',
                is_teaching: false,
                school_id: SID,
                user_id: UID
            });
        } else {
            console.log('Already exists: ' + name);
        }
    }

    // 4. Final Count
    const { data: finalCats } = await supabase.from('report_categories').select('id').eq('school_id', SID);
    console.log('Final Category Count:', finalCats.length);
}

run().catch(console.error);
