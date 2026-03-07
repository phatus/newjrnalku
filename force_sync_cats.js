const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: profiles } = await supabase.from('profiles').select('id, name, school_id');
    console.log('Profiles check:');
    profiles.forEach(p => console.log(`- ${p.name} (${p.id}) -> School: ${p.school_id}`));

    const agus = profiles.find(p => p.name && p.name.includes('Agus'));
    if (!agus) {
        console.error('Agus not found');
        return;
    }

    const SID = agus.school_id;
    console.log('Targeting School ID:', SID);

    const routineCats = [
        { name: 'Upacara / Apel', rhk_label: 'Budaya Sekolah', is_teaching: false },
        { name: 'Piket Mingguan', rhk_label: 'Tugas Tambahan', is_teaching: false },
        { name: 'Pembiasaan Pagi', rhk_label: 'Budaya Sekolah', is_teaching: false }
    ];

    for (const cat of routineCats) {
        const { data: existing } = await supabase.from('report_categories')
            .select('id')
            .eq('name', cat.name)
            .eq('school_id', SID)
            .maybeSingle();

        if (!existing) {
            console.log('Adding: ' + cat.name);
            await supabase.from('report_categories').insert({
                ...cat,
                school_id: SID,
                user_id: agus.id
            });
        } else {
            console.log('Exists: ' + cat.name);
        }
    }
}

run().catch(err => console.error('Error:', err));
