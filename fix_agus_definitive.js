const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const TEMPLATE_ID = 'e62b1c6b-f2d7-4591-97be-492f794df156'; // REAL MTsN 1
    const TARGET_SCHOOL_ID = '4478e65d-2559-450e-bf35-7b7931ef9343'; // Agus's school
    const TARGET_USER_ID = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus

    console.log(`SOURCE: ${TEMPLATE_ID}`);
    console.log(`TARGET: ${TARGET_SCHOOL_ID}`);

    // Clean up any partial data first
    await supabase.from('report_categories').delete().eq('school_id', TARGET_SCHOOL_ID);
    await supabase.from('class_rooms').delete().eq('school_id', TARGET_SCHOOL_ID);
    await supabase.from('implementation_bases').delete().eq('school_id', TARGET_SCHOOL_ID);

    // 1. Categories
    const { data: cats } = await supabase.from('report_categories').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${cats?.length || 0} categories.`);
    if (cats && cats.length > 0) {
        const toInsert = cats.map(c => {
            const { id, created_at, updated_at, ...rest } = c;
            return { ...rest, school_id: TARGET_SCHOOL_ID, user_id: TARGET_USER_ID };
        });
        await supabase.from('report_categories').insert(toInsert);
    }

    // 2. Classes
    const { data: classes } = await supabase.from('class_rooms').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${classes?.length || 0} classes.`);
    if (classes && classes.length > 0) {
        const toInsert = classes.map(c => {
            const { id, created_at, updated_at, ...rest } = c;
            return { ...rest, school_id: TARGET_SCHOOL_ID, user_id: TARGET_USER_ID };
        });
        await supabase.from('class_rooms').insert(toInsert);
    }

    // 3. Bases
    const { data: bases } = await supabase.from('implementation_bases').select('*').eq('school_id', TEMPLATE_ID);
    console.log(`Fetched ${bases?.length || 0} bases.`);
    if (bases && bases.length > 0) {
        const toInsert = bases.map(b => {
            const { id, created_at, updated_at, ...rest } = b;
            return { ...rest, school_id: TARGET_SCHOOL_ID, user_id: TARGET_USER_ID };
        });
        await supabase.from('implementation_bases').insert(toInsert);
    }

    console.log('Verification:');
    const { data: finalCats } = await supabase.from('report_categories').select('id').eq('school_id', TARGET_SCHOOL_ID);
    console.log(`Final Category Count: ${finalCats?.length || 0}`);
}

run();
