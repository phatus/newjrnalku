const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, school_id')
        .eq('email', 'agus.widi@gmail.com')
        .single();

    fs.writeFileSync('d:/agus widi/belajar code/newjurnalku/diag_result.txt', JSON.stringify({
        profile: profile,
        school_id_type: typeof profile?.school_id,
        is_empty: profile?.school_id === ''
    }, null, 2));
}

check();
