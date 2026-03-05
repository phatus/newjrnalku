import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkData() {
    console.log('--- Checking Pivot Data ---')
    const { data: pivot, error } = await supabase.from('activity_class_rooms').select('*')
    if (error) {
        console.error('Error fetching pivot:', error)
    } else {
        console.log(`Pivot entries found: ${pivot?.length || 0}`)
        if (pivot && pivot.length > 0) {
            console.log(pivot.slice(0, 5))
        }
    }

    const { data: activities } = await supabase.from('activities').select('id, description').limit(5)
    console.log('Recent activities:', activities)
}

checkData()
