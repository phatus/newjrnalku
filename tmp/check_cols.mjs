import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkColumns() {
    // We can't use 'describe' easily, but we can try to select one row and see the keys
    const { data, error } = await supabase.from('activities').select('*').limit(1)
    if (data && data.length > 0) {
        console.log('Columns in activities table:', Object.keys(data[0]))
    } else {
        console.log('No data in activities table to check columns.')
        // Try to insert a dummy row with teaching_hours to see if it fails
        const { error: insertError } = await supabase.from('activities').insert({
            user_id: '00000000-0000-0000-0000-000000000000', // invalid uuid but let's see the error
            category_id: 1,
            description: 'test',
            teaching_hours: '1-2'
        })
        console.log('Insert test error:', insertError?.message)
    }
}

checkColumns()
