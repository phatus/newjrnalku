const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function cleanupOrphanedProfiles() {
    console.log('--- Cleaning Up Orphaned Profiles ---')

    try {
        // 1. Get all users from Supabase Auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
        if (authError) throw authError

        const authUserIds = new Set(users.map(u => u.id))
        console.log(`Found ${authUserIds.size} users in Supabase Auth.`)

        // 2. Get all profiles from public.profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, name')
        if (profileError) throw profileError

        console.log(`Found ${profiles.length} profiles in public.profiles.`)

        // 3. Identify orphaned profiles
        const orphans = profiles.filter(p => !authUserIds.has(p.id))

        if (orphans.length === 0) {
            console.log('No orphaned profiles found. Everything is clean.')
            return
        }

        console.log(`Found ${orphans.length} orphaned profiles:`)
        orphans.forEach(o => console.log(`- ${o.id}: ${o.name || 'No Name'}`))

        // 4. Delete orphaned profiles
        const orphanIds = orphans.map(o => o.id)
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .in('id', orphanIds)

        if (deleteError) throw deleteError

        console.log(`Successfully deleted ${orphans.length} orphaned profiles.`)

    } catch (error) {
        console.error('Error during cleanup:', error.message)
    }
}

cleanupOrphanedProfiles()
