import { createClient } from './src/utils/supabase/server'

async function checkDb() {
    const supabase = await createClient()

    const { data: categories } = await supabase.from('report_categories').select('*')
    console.log('Categories:', categories)

    const { data: bases } = await supabase.from('implementation_bases').select('*')
    console.log('Bases:', bases)

    const { data: classes } = await supabase.from('class_rooms').select('*')
    console.log('Classes:', classes)
}

checkDb()
