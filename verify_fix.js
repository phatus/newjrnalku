const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const s = 'e62b1c6b-f2d7-400d-8547-49608cad17a3'; // Agus's school
    const { data: c } = await supabase.from('report_categories').select('id').eq('school_id', s);
    const { data: cl } = await supabase.from('class_rooms').select('id').eq('school_id', s);
    const { data: b } = await supabase.from('implementation_bases').select('id').eq('school_id', s);
    console.log(`Final counts for MTsN 2:`);
    console.log(`- Categories: ${c?.length || 0}`);
    console.log(`- Classes: ${cl?.length || 0}`);
    console.log(`- Bases: ${b?.length || 0}`);
}

run();
