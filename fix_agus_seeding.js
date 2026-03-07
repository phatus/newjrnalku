const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const TEMPLATE_ID = 'ced5cf8e-07a9-4b2a-8742-990a071446f7'; // MTsN 1 (Source)
    const TARGET_SCHOOL_ID = 'e62b1c6b-f2d7-400d-8547-49608cad17a3'; // MTsN 2 (Target - Agus's school)
    const TARGET_USER_ID = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus

    console.log(`Copying template from ${TEMPLATE_ID} to ${TARGET_SCHOOL_ID} for user ${TARGET_USER_ID}`);

    // 1. Categories
    const { data: cats } = await supabase.from('report_categories').select('name, rhk_label, is_teaching').eq('school_id', TEMPLATE_ID);
    if (cats && cats.length > 0) {
        console.log(`Copying ${cats.length} categories...`);
        const catRecords = cats.map(c => ({
            ...c,
            school_id: TARGET_SCHOOL_ID,
            user_id: TARGET_USER_ID
        }));
        const { error } = await supabase.from('report_categories').insert(catRecords);
        if (error) console.error('Error inserting cats:', error);
    }

    // 2. Classes
    const { data: classes } = await supabase.from('class_rooms').select('name').eq('school_id', TEMPLATE_ID);
    if (classes && classes.length > 0) {
        console.log(`Copying ${classes.length} classes...`);
        const classRecords = classes.map(c => ({
            ...c,
            school_id: TARGET_SCHOOL_ID,
            user_id: TARGET_USER_ID
        }));
        const { error } = await supabase.from('class_rooms').insert(classRecords);
        if (error) console.error('Error inserting classes:', error);
    }

    // 3. Bases
    const { data: bases } = await supabase.from('implementation_bases').select('name').eq('school_id', TEMPLATE_ID);
    if (bases && bases.length > 0) {
        console.log(`Copying ${bases.length} bases...`);
        const baseRecords = bases.map(b => ({
            ...b,
            school_id: TARGET_SCHOOL_ID,
            user_id: TARGET_USER_ID
        }));
        const { error } = await supabase.from('implementation_bases').insert(baseRecords);
        if (error) console.error('Error inserting bases:', error);
    }

    console.log('Done!');
}

run();
