'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActivitySchema } from '@/lib/schemas'
import { calculateMonthlyCounts } from '@/utils/date-utils'

export async function createActivity(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Validate input using Zod
    const rawData = Object.fromEntries(formData.entries())
    const validation = ActivitySchema.safeParse(rawData)

    if (!validation.success) {
        const errorMsg = validation.error.issues[0].message
        throw new Error(errorMsg)
    }

    const validatedData = validation.data
    const { category_id, activity_date, description, evidence_link, implementation_basis_id, student_count, teaching_hours, topic, student_outcome, class_room_ids } = validatedData

    // Insert Activity
    const { data: activity, error: activityError } = await supabase
        .from('activities')
        .insert({
            user_id: user.id,
            category_id,
            implementation_basis_id,
            activity_date,
            description,
            evidence_link,
            teaching_hours,
            topic,
            student_outcome,
            student_count,
            status: 'Selesai'
        })
        .select()
        .single()

    if (activityError) {
        console.error('Activity Error:', activityError)
        return { success: false, error: activityError.message };
    }

    // Handle Class Rooms pivot if it's a teaching activity
    if (class_room_ids && activity) {
        const ids = class_room_ids.split(',').map(id => id.trim()).filter(id => id !== "")
        if (ids.length > 0) {
            const pivotData = ids.map(class_id => ({
                activity_id: activity.id,
                class_room_id: parseInt(class_id, 10)
            }))

            // Use admin client to bypass RLS on pivot table activity_class_rooms
            const adminSupabase = createAdminClient()
            const { error: pivotError } = await adminSupabase
                .from('activity_class_rooms')
                .insert(pivotData)

            if (pivotError) console.error('Pivot Error:', pivotError)
        }
    }

    revalidatePath('/')
    revalidatePath('/reports')
    return redirect('/')
}

export async function getCategories() {
    const supabase = await createClient()
    const { data: { user } = { user: null } } = await supabase.auth.getUser()

    let query = supabase.from('report_categories').select('*')

    if (user) {
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`)
    } else {
        query = query.is('user_id', null)
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    return data
}

export async function getClassRooms() {
    const supabase = await createClient()
    const { data: { user } = { user: null } } = await supabase.auth.getUser()

    let query = supabase.from('class_rooms').select('*')

    if (user) {
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`)
    } else {
        query = query.is('user_id', null)
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    return data
}

export async function getImplementationBases() {
    const supabase = await createClient()
    const { data: { user } = { user: null } } = await supabase.auth.getUser()

    let query = supabase.from('implementation_bases').select('*')

    if (user) {
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`)
    } else {
        query = query.is('user_id', null)
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    return data
}

export async function getRecentActivities() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('activities')
        .select(`
      *,
      category:report_categories(name, is_teaching)
    `)
        .order('created_at', { ascending: false })
        .limit(5)
    return data || []
}

export async function getMonthlyStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { counts: Array(12).fill(0), raw: [] };

    const { data, error } = await supabase
        .from('activities')
        .select('activity_date')
        .eq('user_id', user.id);

    if (error) {
        console.error('getMonthlyStats error', error);
        return { counts: Array(12).fill(0), raw: [] };
    }

    const raw = data || [];
    const counts = calculateMonthlyCounts(raw);

    return { counts, raw };
}

export async function getDashboardStats() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return {
                totalActivities: 0,
                teachingActivities: 0,
                dailyAverage: 0,
                performancePoints: 0
            }
        }

        // Total Activities
        const { count: totalActivities, error: totalError } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (totalError) console.error('Stats - Total Error:', totalError)

        // Teaching Activities (simplified approach)
        const { count: teachingCount, error: teachingError } = await supabase
            .from('activities')
            .select('report_categories!inner(is_teaching)', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('report_categories.is_teaching', true)

        if (teachingError) console.error('Stats - Teaching Error:', teachingError)

        const total = totalActivities || 0
        const teaching = teachingCount || 0

        return {
            totalActivities: total,
            teachingActivities: teaching,
            dailyAverage: total / 30,
            performancePoints: total * 10
        }
    } catch (error) {
        console.error('getDashboardStats Error:', error)
        return {
            totalActivities: 0,
            teachingActivities: 0,
            dailyAverage: 0,
            performancePoints: 0
        }
    }
}
export async function seedInitialData(formData: FormData) {
    const supabase = createAdminClient()

    try {
        // 1. Seed Categories
        const categories = [
            { name: 'Kegiatan Belajar Mengajar (KBM)', rhk_label: 'Proses Pembelajaran', is_teaching: true },
            { name: 'Administrasi Kurikulum', rhk_label: 'Administrasi Sekolah', is_teaching: false },
            { name: 'Pengembangan Diri (Pelatihan)', rhk_label: 'Kompetensi Guru', is_teaching: false },
            { name: 'Tugas Tambahan (Wali Kelas)', rhk_label: 'Tugas Tambahan', is_teaching: false },
            { name: 'Kegiatan Ekstrakurikuler', rhk_label: 'Kesiswaan', is_teaching: false },
        ]

        for (const cat of categories) {
            const { data } = await supabase.from('report_categories').select('id').eq('name', cat.name).maybeSingle()
            if (!data) {
                await supabase.from('report_categories').insert(cat)
            }
        }

        // 2. Seed Class Rooms
        const classes = [
            { name: 'X RPL 1' }, { name: 'X RPL 2' },
            { name: 'XI RPL 1' }, { name: 'XI RPL 2' },
            { name: 'XII RPL 1' }, { name: 'XII RPL 2' },
        ]
        for (const cls of classes) {
            const { data } = await supabase.from('class_rooms').select('id').eq('name', cls.name).maybeSingle()
            if (!data) {
                await supabase.from('class_rooms').insert(cls)
            }
        }

        // 3. Seed Implementation Bases
        const bases = [
            { name: 'SK Pembagian Tugas Mengajar' },
            { name: 'Surat Tugas Kepala Sekolah' },
            { name: 'Program Kerja Sekolah' },
        ]
        for (const base of bases) {
            const { data } = await supabase.from('implementation_bases').select('id').eq('name', base.name).maybeSingle()
            if (!data) {
                await supabase.from('implementation_bases').insert(base)
            }
        }

        revalidatePath('/activities/create')
        return redirect('/activities/create?message=' + encodeURIComponent('Data dasar berhasil diinisialisasi!') + '&type=success')

    } catch (error) {
        console.error('Seed Error:', error)
        return redirect('/activities/create?message=' + encodeURIComponent('Gagal melakukan seeding data.') + '&type=error')
    }
}

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Check if user is admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Forbidden')

    const school_name = formData.get('school_name') as string
    const school_address = formData.get('school_address') as string
    const headmaster_name = formData.get('headmaster_name') as string
    const headmaster_nip = formData.get('headmaster_nip') as string
    const headmaster_pangkat = formData.get('headmaster_pangkat') as string
    const headmaster_jabatan = formData.get('headmaster_jabatan') as string

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('school_settings')
        .upsert({
            id: 1, // We only ever have one row for settings
            school_name,
            school_address,
            headmaster_name,
            headmaster_nip,
            headmaster_pangkat,
            headmaster_jabatan,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Settings Update Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/settings')
    return redirect('/settings?message=' + encodeURIComponent('Pengaturan sekolah berhasil disimpan!') + '&type=success')
}

export async function getActivities(month?: number, year?: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Use admin client to bypass RLS on pivot table activity_class_rooms
    const adminSupa = createAdminClient()

    try {
        let query = adminSupa
            .from('activities')
            .select(`
                *,
                category:report_categories(name, is_teaching),
                basis:implementation_bases(name),
                classes:activity_class_rooms(
                    class:class_rooms(id, name)
                )
            `)
            .eq('user_id', user.id)

        if (month && year) {
            const lastDay = new Date(year, month, 0).getDate();
            query = query
                .gte('activity_date', `${year}-${String(month).padStart(2, '0')}-01`)
                .lte('activity_date', `${year}-${String(month).padStart(2, '0')}-${lastDay}`);
        }

        const { data, error } = await query.order('activity_date', { ascending: false })

        if (error) {
            console.error('getActivities Error:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('getActivities Exception:', error)
        return []
    }
}

export async function getActivityById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const adminSupa = createAdminClient()
    const { data, error } = await adminSupa
        .from('activities')
        .select(`
            *,
            category:report_categories(*),
            basis:implementation_bases(*),
            classes:activity_class_rooms(
                class_room_id
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function updateActivity(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Validate input using Zod
    const rawData = Object.fromEntries(formData.entries())
    const validation = ActivitySchema.safeParse(rawData)

    if (!validation.success) {
        const errorMsg = validation.error.issues[0].message
        throw new Error(errorMsg)
    }

    const validatedData = validation.data
    const { category_id, activity_date, description, evidence_link, implementation_basis_id, student_count, teaching_hours, topic, student_outcome, class_room_ids } = validatedData

    // Update Activity
    const { error: activityError } = await supabase
        .from('activities')
        .update({
            category_id,
            implementation_basis_id,
            activity_date,
            description,
            evidence_link,
            teaching_hours,
            topic,
            student_outcome,
            student_count,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (activityError) return { success: false, error: activityError.message };

    // Update Class Rooms Pivot
    const adminSupabase = createAdminClient()

    // 1. Delete existing pivots
    await adminSupabase.from('activity_class_rooms').delete().eq('activity_id', id)

    // 2. Insert new pivots if any
    if (class_room_ids) {
        const ids = class_room_ids.split(',').map(cid => cid.trim()).filter(cid => cid !== "")
        if (ids.length > 0) {
            const pivotData = ids.map(class_id => ({
                activity_id: id,
                class_room_id: parseInt(class_id, 10)
            }))
            await adminSupabase.from('activity_class_rooms').insert(pivotData)
        }
    }

    revalidatePath('/activities')
    revalidatePath('/')
    return redirect('/activities?message=' + encodeURIComponent('Data berhasil diperbarui!') + '&type=success')
}

export async function deleteActivity(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/activities')
    revalidatePath('/')
    return { success: true }
}
