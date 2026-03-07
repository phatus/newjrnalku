const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('URL:', supabaseUrl);

    const tables = ['report_categories', 'class_rooms', 'implementation_bases'];
    for (const table of tables) {
        console.log(`\n--- ALL RECORDS FROM ${table} ---`);
        const { data, error } = await supabase.from(table).select('id, name, school_id, user_id');
        if (error) {
            console.error(`Error fetching ${table}:`, error);
            continue;
        }
        if (!data || data.length === 0) {
            console.log(`${table} is empty.`);
            continue;
        }
        console.log(`Total ${table}: ${data.length}`);
        const schoolMap = {};
        data.forEach(r => {
            const sid = r.school_id || 'NULL';
            if (!schoolMap[sid]) schoolMap[sid] = 0;
            schoolMap[sid]++;
        });
        console.log('School distribution:', schoolMap);
        console.log('Sample record:', data[0]);
    }

    const { data: schools } = await supabase.from('schools').select('id, name, npsn');
    console.log('\n--- ALL SCHOOLS ---');
    console.log(JSON.stringify(schools, null, 2));
}

run();
