const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const TEMPLATE_ID = 'ced5cf8e-07a9-4b2a-8742-990a071446f7'; // MTsN 1
    const TARGET_SCHOOL_ID = 'e62b1c6b-f2d7-400d-8547-49608cad17a3'; // MTsN 2
    const TARGET_USER_ID = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus

    console.log(`SOURCE: ${TEMPLATE_ID}`);
    console.log(`TARGET: ${TARGET_SCHOOL_ID} / ${TARGET_USER_ID}`);

    const { data: cats } = await supabase.from('report_categories').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${cats?.length || 0} categories.`);

    if (cats && cats.length > 0) {
        const toInsert = cats.map(c => {
            const { id, created_at, ...rest } = c; // Remove PK and metadata
            return {
                ...rest,
                school_id: TARGET_SCHOOL_ID,
                user_id: TARGET_USER_ID
            };
        });
        console.log(`Inserting ${toInsert.length} records...`);
        const { data, error } = await supabase.from('report_categories').insert(toInsert).select();
        if (error) {
            console.error('Insert Error:', error);
        } else {
            console.log(`Successfully inserted ${data.length} records.`);
        }
    }
}

run();
