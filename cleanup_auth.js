const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupAuth() {
    console.log('--- Cleaning Up Orphaned Auth Users ---')
    try {
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
        if (authError) throw authError

        const { data: profiles, error: profileError } = await supabase.from('profiles').select('id')
        if (profileError) throw profileError

        const profileIds = new Set(profiles.map(p => p.id))
        const orphans = users.filter(u => !profileIds.has(u.id))

        if (orphans.length === 0) {
            console.log('No orphaned auth users found.')
            return
        }

        console.log(`Found ${orphans.length} orphaned auth users to delete.`)
        for (const user of orphans) {
            console.log(`Deleting auth user: ${user.id} (${user.email})`)
            const { error: delError } = await supabase.auth.admin.deleteUser(user.id)
            if (delError) console.error(`Error deleting ${user.id}:`, delError.message)
            else console.log(`Deleted ${user.id}`)
        }

    } catch (err) {
        console.error('Error:', err.message)
    }
}

cleanupAuth()
