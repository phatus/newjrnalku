const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const userId = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', userId).single();
    console.log(`Agus school_id: ${profile.school_id}`);

    const { data: school } = await supabase.from('schools').select('name').eq('id', profile.school_id).single();
    console.log(`School Name: ${school.name}`);
}

run();
