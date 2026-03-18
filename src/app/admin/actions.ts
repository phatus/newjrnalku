'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- Categories ---
export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user!.id).maybeSingle()

    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string
    const rhk_label = formData.get('rhk_label') as string
    const is_teaching = formData.get('is_teaching') === 'true'

    const { error } = await adminSupabase
        .from('report_categories')
        .insert({ name, rhk_label, is_teaching, school_id: profile?.school_id })

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user!.id).maybeSingle()

    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string

    const { error } = await adminSupabase
        .from('class_rooms')
        .insert({ name, school_id: profile?.school_id })

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user!.id).maybeSingle()

    const adminSupabase = createAdminClient()
    const name = formData.get('name') as string

    const { error } = await adminSupabase
        .from('implementation_bases')
        .insert({ name, school_id: profile?.school_id })

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user!.id).maybeSingle()

    const adminSupabase = createAdminClient()
    let query = adminSupabase.from('profiles').select('*')

    // super_admin sees all, admin sees only their school
    if (profile?.role !== 'super_admin' && profile?.school_id) {
        query = query.eq('school_id', profile.school_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
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

    try {
        // 1. First delete related activities and their class associations
        // Get all activities for this user
        const { data: activities } = await adminSupabase
            .from('activities')
            .select('id')
            .eq('user_id', id)

        const activityIds = activities?.map(a => a.id) || []

        // Delete from pivot table first
        if (activityIds.length > 0) {
            await adminSupabase
                .from('activity_class_rooms')
                .delete()
                .in('activity_id', activityIds)
        }

        // Delete activities
        await adminSupabase
            .from('activities')
            .delete()
            .eq('user_id', id)

        // 2. Delete from public.profiles
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .delete()
            .eq('id', id)

        if (profileError) throw profileError

        // 3. Delete from Supabase Auth (auth.users)
        const { error: authError } = await adminSupabase.auth.admin.deleteUser(id)

        if (authError) throw authError

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: unknown) {
        console.error('Delete User Error:', error)
        const err = error as { message?: string };
        throw new Error(err.message || 'Gagal menghapus pengguna')
    }
}

export async function updateUserPassword(id: string, password: string) {
    const adminSupabase = createAdminClient()

    try {
        const { error } = await adminSupabase.auth.admin.updateUserById(id, {
            password: password
        })

        if (error) throw error

        return { success: true }
    } catch (error: unknown) {
        console.error('Update Password Error:', error)
        const err = error as { message?: string };
        throw new Error(err.message || 'Gagal memperbarui password')
    }
}
