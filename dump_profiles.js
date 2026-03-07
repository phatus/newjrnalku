const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- ALL PROFILES ---');
    const { data: profiles, error } = await supabase.from('profiles').select('id, name, role, school_id');
    if (error) return console.error(error);
    profiles.forEach(p => console.log(`${p.id} | ${p.name} | ${p.role} | ${p.school_id}`));
}

run();
