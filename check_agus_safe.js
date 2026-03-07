const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const userId = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus
    const { data: profiles, error: pError } = await supabase.from('profiles').select('school_id, name').eq('id', userId);

    if (pError) return console.error('Profile Error:', pError);
    if (!profiles || profiles.length === 0) return console.log('No profile found for Agus');

    const profile = profiles[0];
    console.log(`Agus Name: ${profile.name}`);
    console.log(`Agus school_id: ${profile.school_id}`);

    const { data: schools } = await supabase.from('schools').select('id, name').eq('id', profile.school_id);
    if (schools && schools.length > 0) {
        console.log(`School Name: ${schools[0].name}`);
    } else {
        console.log('Agus school_id does not exist in schools table!');
    }
}

run();
