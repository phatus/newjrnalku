import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env.local' })

async function verify() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        console.error('Missing URL or Key')
        return
    }

    const supabase = createClient(url, key)

    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (error) {
        console.error('Connection Failed:', error.message)
    } else {
        console.log('Connection Successful! Total profiles:', data)
    }
}

verify()
