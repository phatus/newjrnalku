'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Guard ---
async function requireSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role !== 'super_admin') throw new Error('Forbidden')
    return user
}

// --- Stats ---
export async function getPlatformStats() {
    await requireSuperAdmin()
    const adminSupabase = createAdminClient()

    const [schoolsRes, usersRes, activitiesRes] = await Promise.all([
        adminSupabase.from('schools').select('id', { count: 'exact', head: true }),
        adminSupabase.from('profiles').select('id', { count: 'exact', head: true }),
        adminSupabase.from('activities').select('id', { count: 'exact', head: true }),
    ])

    return {
        totalSchools: schoolsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalActivities: activitiesRes.count || 0,
    }
}

// --- Schools ---
export async function getAllSchools() {
    await requireSuperAdmin()
    const adminSupabase = createAdminClient()

    const { data: schools, error } = await adminSupabase
        .from('schools')
        .select(`
            *,
            members:profiles(count)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get Schools Error:', error)
        return []
    }
    return schools || []
}

export async function getSchoolDetail(schoolId: string) {
    await requireSuperAdmin()
    const adminSupabase = createAdminClient()

    const [schoolRes, membersRes, activitiesRes] = await Promise.all([
        adminSupabase.from('schools').select('*').eq('id', schoolId).maybeSingle(),
        adminSupabase.from('profiles').select('id, name, role, created_at').eq('school_id', schoolId).order('created_at'),
        adminSupabase.from('activities').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
    ])

    return {
        school: schoolRes.data,
        members: membersRes.data || [],
        activityCount: activitiesRes.count || 0,
    }
}

export async function toggleSchoolActive(schoolId: string) {
    await requireSuperAdmin()
    const adminSupabase = createAdminClient()

    // Get current status
    const { data: school } = await adminSupabase
        .from('schools')
        .select('is_active')
        .eq('id', schoolId)
        .maybeSingle()

    if (!school) throw new Error('School not found')

    const { error } = await adminSupabase
        .from('schools')
        .update({ is_active: !school.is_active, updated_at: new Date().toISOString() })
        .eq('id', schoolId)

    if (error) throw new Error(error.message)
    revalidatePath('/super-admin')
    return { success: true }
}

export async function deleteSchool(schoolId: string) {
    await requireSuperAdmin()
    const adminSupabase = createAdminClient()

    // Get all activities for this school
    const { data: activities } = await adminSupabase
        .from('activities')
        .select('id')
        .eq('school_id', schoolId)
    const activityIds = activities?.map(a => a.id) || []

    // Delete activity_class_rooms
    if (activityIds.length > 0) {
        await adminSupabase.from('activity_class_rooms').delete().in('activity_id', activityIds)
    }

    // Delete activities
    await adminSupabase.from('activities').delete().eq('school_id', schoolId)

    // Delete master data
    await adminSupabase.from('report_categories').delete().eq('school_id', schoolId)
    await adminSupabase.from('class_rooms').delete().eq('school_id', schoolId)
    await adminSupabase.from('implementation_bases').delete().eq('school_id', schoolId)

    // Unlink profiles (set school_id to null)
    await adminSupabase.from('profiles').update({ school_id: null }).eq('school_id', schoolId)

    // Delete the school
    const { error } = await adminSupabase.from('schools').delete().eq('id', schoolId)
    if (error) throw new Error(error.message)

    revalidatePath('/super-admin')
    return { success: true }
}

export async function updateSchoolSettings(schoolId: string, formData: FormData) {
    await requireSuperAdmin()
    const adminSupabase = createAdminClient()

    const name = formData.get('name') as string
    const address = formData.get('address') as string

    const { error } = await adminSupabase
        .from('schools')
        .update({
            name,
            address,
            updated_at: new Date().toISOString()
        })
        .eq('id', schoolId)

    if (error) throw new Error(error.message)
    revalidatePath('/super-admin')
    return redirect('/super-admin?message=' + encodeURIComponent('Sekolah berhasil diperbarui.') + '&type=success')
}
