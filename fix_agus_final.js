const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const TEMPLATE_ID = 'ced5cf8e-07a9-4b2a-8742-990a071446f7'; // MTsN 1 (Source)
    const TARGET_SCHOOL_ID = '4478e65d-2559-450e-bf35-7b7931ef9343'; // Agus's REAL school ID
    const TARGET_USER_ID = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus

    console.log(`SOURCE: ${TEMPLATE_ID}`);
    console.log(`TARGET: ${TARGET_SCHOOL_ID} / ${TARGET_USER_ID}`);

    // 1. Categories
    const { data: cats } = await supabase.from('report_categories').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${cats?.length || 0} categories.`);
    if (cats && cats.length > 0) {
        const toInsert = cats.map(c => {
            const { id, created_at, ...rest } = c;
            return { ...rest, school_id: TARGET_SCHOOL_ID, user_id: TARGET_USER_ID };
        });
        const { error } = await supabase.from('report_categories').insert(toInsert);
        if (error) console.error('Cats Error:', error);
        else console.log('Cats inserted.');
    }

    // 2. Classes
    const { data: classes } = await supabase.from('class_rooms').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${classes?.length || 0} classes.`);
    if (classes && classes.length > 0) {
        const toInsert = classes.map(c => {
            const { id, created_at, ...rest } = c;
            return { ...rest, school_id: TARGET_SCHOOL_ID, user_id: TARGET_USER_ID };
        });
        const { error } = await supabase.from('class_rooms').insert(toInsert);
        if (error) console.error('Classes Error:', error);
        else console.log('Classes inserted.');
    }

    // 3. Bases
    const { data: bases } = await supabase.from('implementation_bases').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${bases?.length || 0} bases.`);
    if (bases && bases.length > 0) {
        const toInsert = bases.map(b => {
            const { id, created_at, ...rest } = b;
            return { ...rest, school_id: TARGET_SCHOOL_ID, user_id: TARGET_USER_ID };
        });
        const { error } = await supabase.from('implementation_bases').insert(toInsert);
        if (error) console.error('Bases Error:', error);
        else console.log('Bases inserted.');
    }

    console.log('Final Verification:');
    const { data: finalCats } = await supabase.from('report_categories').select('id').eq('school_id', TARGET_SCHOOL_ID);
    console.log(`Final Category Count: ${finalCats?.length || 0}`);
}

run();
