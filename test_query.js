const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const schoolId = 'e62b1c6b-f2d7-400d-8547-49608cad17a3'; // MTsN 2
    const userId = 'b56d8671-d6d7-400d-8547-49608cad17a3'; // Agus

    console.log(`School: ${schoolId}`);
    console.log(`User  : ${userId}`);

    // Exact query from activities/actions.ts (using or)
    // and(user_id.is.null,school_id.is.null) -> GLOBAL
    // school_id.eq.SID -> SCHOOL
    // user_id.eq.UID -> USER

    // Test 1: Full OR query
    const { data: d1, error: e1 } = await supabase
        .from('report_categories')
        .select('*')
        .or(`and(user_id.is.null,school_id.is.null),school_id.eq.${schoolId},user_id.eq.${userId}`);

    console.log(`\n--- TEST 1: Full OR query ---`);
    if (e1) console.error('Error:', e1);
    console.log(`Found ${d1?.length || 0} records.`);
    if (d1 && d1.length > 0) {
        console.log('Sample school_id:', d1[0].school_id);
        console.log('Sample user_id:', d1[0].user_id);
    }

    // Test 2: Simplified OR (no nested and)
    const { data: d2, error: e2 } = await supabase
        .from('report_categories')
        .select('*')
        .or(`school_id.eq.${schoolId},user_id.eq.${userId}`);

    console.log(`\n--- TEST 2: Simplified OR ---`);
    if (e2) console.error('Error:', e2);
    console.log(`Found ${d2?.length || 0} records.`);

    // Test 3: Direct School ID check
    const { data: d3 } = await supabase
        .from('report_categories')
        .select('*')
        .eq('school_id', schoolId);

    console.log(`\n--- TEST 3: Direct school_id eq ---`);
    console.log(`Found ${d3?.length || 0} records.`);
}

run();
