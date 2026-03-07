const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- SCHOOLS ---');
    const { data: schools } = await supabase.from('schools').select('id, name, npsn');
    schools.forEach(s => console.log(`${s.id} | ${s.name} | ${s.npsn}`));

    console.log('\n--- REPORT CATEGORIES (BY SCHOOL) ---');
    const { data: cats } = await supabase.from('report_categories').select('name, school_id');
    const map = {};
    cats.forEach(c => {
        if (!map[c.school_id]) map[c.school_id] = [];
        map[c.school_id].push(c.name);
    });
    for (const sid in map) {
        console.log(`School ${sid} has ${map[sid].length} categories:`, map[sid].slice(0, 3), '...');
    }

    console.log('\n--- CLASS ROOMS (BY SCHOOL) ---');
    const { data: classes } = await supabase.from('class_rooms').select('name, school_id');
    const cmap = {};
    classes.forEach(c => {
        if (!cmap[c.school_id]) cmap[c.school_id] = [];
        cmap[c.school_id].push(c.name);
    });
    for (const sid in cmap) {
        console.log(`School ${sid} has ${cmap[sid].length} classes:`, cmap[sid].slice(0, 3), '...');
    }
}

run();
