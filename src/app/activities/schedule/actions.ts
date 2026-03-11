'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getSchedules() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const today = new Date().toISOString().split('T')[0]

    try {
        // Use admin client to bypass RLS on pivot table schedule_class_rooms
        const adminSupa = createAdminClient()
        const { data, error } = await adminSupa
            .from('activity_schedules')
            .select(`
                *,
                report_categories(name),
                schedule_class_rooms(class_room_id, class_rooms(name))
            `)
            .eq('user_id', user.id)
            .order('day_of_week')

        if (error) {
            console.error('Error fetching schedules:', error)
            return []
        }

        // Check which ones are already confirmed for today
        const { data: todayActivities } = await supabase
            .from('activities')
            .select('schedule_id')
            .eq('user_id', user.id)
            .eq('activity_date', today)
            .not('schedule_id', 'is', null)

        const confirmedIds = new Set(todayActivities?.map(a => a.schedule_id).filter(Boolean) || [])

        return (data || []).map(s => ({
            ...s,
            is_confirmed_today: confirmedIds.has(s.id)
        }))
    } catch (e) {
        console.error('getSchedules Error:', e)
        return []
    }
}

export async function saveSchedule(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const days_of_week = (formData.get('days_of_week') as string || '').split(',').filter(id => id).map(id => parseInt(id, 10))
    const category_id = parseInt(formData.get('category_id') as string, 10)
    const implementation_basis_id = parseInt(formData.get('implementation_basis_id') as string, 10) || null
    const topic = formData.get('topic') as string
    const description = formData.get('description') as string || null
    const teaching_hours = formData.get('teaching_hours') as string || null
    const class_room_ids = (formData.get('class_room_ids') as string || '').split(',').filter(id => id).map(id => parseInt(id, 10))

    if (days_of_week.length === 0) throw new Error('Harap pilih minimal satu hari')

    // Get user's school_id
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle()

    for (const day_of_week of days_of_week) {
        const { data: schedule, error: scheduleError } = await supabase
            .from('activity_schedules')
            .insert({
                user_id: user.id,
                school_id: profile?.school_id,
                category_id,
                implementation_basis_id,
                day_of_week,
                topic,
                description,
                teaching_hours,
                is_active: true
            })
            .select()
            .single()

        if (scheduleError) throw scheduleError

        if (class_room_ids.length > 0 && schedule) {
            const pivotData = class_room_ids.map(class_id => ({
                schedule_id: schedule.id,
                class_room_id: class_id
            }))
            const adminSupabase = createAdminClient()
            const { error: pivotError } = await adminSupabase.from('schedule_class_rooms').insert(pivotData)
            if (pivotError) {
                console.error('saveSchedule Pivot Error:', pivotError)
                // Continue to next day even if pivot fails? Better to throw or log
                throw new Error(`Gagal menyimpan data kelas untuk hari ${day_of_week}: ${pivotError.message}`)
            }
        }
    }

    revalidatePath('/activities/schedule')
}

export async function deleteSchedule(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('activity_schedules').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/activities/schedule')
}

export async function updateSchedule(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const days_of_week = (formData.get('days_of_week') as string || '').split(',').filter(id => id).map(id => parseInt(id, 10))
    const category_id = parseInt(formData.get('category_id') as string, 10)
    const implementation_basis_id = parseInt(formData.get('implementation_basis_id') as string, 10) || null
    const topic = formData.get('topic') as string
    const description = formData.get('description') as string || null
    const teaching_hours = formData.get('teaching_hours') as string || null
    const class_room_ids = (formData.get('class_room_ids') as string || '').split(',').filter(id => id).map(id => parseInt(id, 10))

    if (days_of_week.length === 0) throw new Error('Harap pilih minimal satu hari')
    // Note: Since we are updating a single record by ID, we only use the first day if multiple were somehow selected, 
    // but typically edit is only for one record. If multiple days were intended to be updated together, 
    // we would need a different approach (like bulk edit), but for now, we follow the ID.
    const day_of_week = days_of_week[0]

    const { error: updateError } = await supabase
        .from('activity_schedules')
        .update({
            category_id,
            implementation_basis_id,
            day_of_week,
            topic,
            description,
            teaching_hours
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (updateError) throw updateError

    // Handle classes: Delete and Re-insert
    const adminSupabase = createAdminClient()
    const { error: deletePivotError } = await adminSupabase.from('schedule_class_rooms').delete().eq('schedule_id', id)
    if (deletePivotError) throw deletePivotError

    if (class_room_ids.length > 0) {
        const pivotData = class_room_ids.map(class_id => ({
            schedule_id: id,
            class_room_id: class_id
        }))
        const { error: pivotError } = await adminSupabase.from('schedule_class_rooms').insert(pivotData)
        if (pivotError) {
            console.error('updateSchedule Pivot Error:', pivotError)
            throw new Error(`Gagal memperbarui data kelas: ${pivotError.message}`)
        }
    }

    revalidatePath('/activities/schedule')
}

export async function convertScheduleToActivity(scheduleId: string, date: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 0. Check for existing activity for this schedule and date
    const { data: existing } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', user.id)
        .eq('schedule_id', scheduleId)
        .eq('activity_date', date)
        .maybeSingle()

    if (existing) {
        return { success: false, error: 'Kegiatan untuk jadwal ini sudah dibuat hari ini.' }
    }

    // 1. Fetch Schedule Data (with adminSupabase to bypass RLS on pivot)
    const adminSupa = createAdminClient()
    const { data: schedule, error: fetchError } = await adminSupa
        .from('activity_schedules')
        .select('*, schedule_class_rooms(class_room_id)')
        .eq('id', scheduleId)
        .single()

    if (fetchError || !schedule) throw new Error('Schedule not found')

    // 2. Create Activity
    const { data: activity, error: activityError } = await supabase
        .from('activities')
        .insert({
            user_id: user.id,
            school_id: schedule.school_id,
            category_id: schedule.category_id,
            implementation_basis_id: schedule.implementation_basis_id,
            schedule_id: schedule.id, // Link back to schedule
            activity_date: date,
            description: schedule.description || 'Kegiatan Rutin Terjadwal',
            topic: schedule.topic || 'Kegiatan Rutin',
            learning_material: null, // To be filled during teaching
            teaching_hours: schedule.teaching_hours || 0,
            student_count: 32,
            learning_outcome: null,
            status: 'Selesai'
        })
        .select()
        .single()

    if (activityError) throw activityError

    // 3. Handle Classes
    if (schedule.schedule_class_rooms && schedule.schedule_class_rooms.length > 0) {
        const pivotData = schedule.schedule_class_rooms.map((p: any) => ({
            activity_id: activity.id,
            class_room_id: p.class_room_id
        }))
        const adminSupabase = createAdminClient()
        const { error: pivotError } = await adminSupabase.from('activity_class_rooms').insert(pivotData)
        if (pivotError) console.error('Pivot insert error:', pivotError)
    }

    revalidatePath('/')
    revalidatePath('/activities')
    return { success: true }
}
