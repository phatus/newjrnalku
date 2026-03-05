'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Categories ---
export async function createCategory(formData: FormData) {
    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string
    const rhk_label = formData.get('rhk_label') as string
    const is_teaching = formData.get('is_teaching') === 'true'

    const { error } = await adminSupabase
        .from('report_categories')
        .insert({ name, rhk_label, is_teaching })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/categories')
    return { success: true }
}

export async function deleteCategory(id: number) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('report_categories')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/categories')
    return { success: true }
}

export async function updateCategory(id: number, formData: FormData) {
    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string
    const rhk_label = formData.get('rhk_label') as string
    const is_teaching = formData.get('is_teaching') === 'true'

    const { error } = await adminSupabase
        .from('report_categories')
        .update({ name, rhk_label, is_teaching })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/categories')
    return { success: true }
}

// --- Classes ---
export async function createClass(formData: FormData) {
    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string

    const { error } = await adminSupabase
        .from('class_rooms')
        .insert({ name })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/classes')
    return { success: true }
}

export async function deleteClass(id: number) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('class_rooms')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/classes')
    return { success: true }
}

// --- Implementation Bases ---
export async function createBase(formData: FormData) {
    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string

    const { error } = await adminSupabase
        .from('implementation_bases')
        .insert({ name })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/bases')
    return { success: true }
}

export async function deleteBase(id: number) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('implementation_bases')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/bases')
    return { success: true }
}

// --- Users ---
export async function getUsers() {
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function updateUserRole(id: string, role: string) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('profiles')
        .update({ role })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/users')
    return { success: true }
}

export async function deleteUser(id: string) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/users')
    return { success: true }
}
