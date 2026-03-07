const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data: cats } = await supabase.from('report_categories').select('name, school_id, user_id');
    console.log(`TOTAL Categories: ${cats?.length || 0}`);
    if (cats) {
        cats.forEach(c => {
            console.log(`'${c.name}' | '${c.school_id}' | '${c.user_id}'`);
        });
    }

    const { data: schools } = await supabase.from('schools').select('id, name');
    console.log('\nSCHOOLS:');
    schools?.forEach(s => {
        console.log(`'${s.name}' | '${s.id}'`);
    });
}

run();
