'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function createSchool(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const npsn = (formData.get('npsn') as string)?.trim()
    const schoolName = (formData.get('school_name') as string)?.trim() || (formData.get('school_name_manual') as string)?.trim()
    const schoolAddress = (formData.get('school_address') as string)?.trim() || (formData.get('school_address_manual') as string)?.trim()
    const schoolCity = (formData.get('school_city') as string)?.trim() || (formData.get('school_city_manual') as string)?.trim()

    if (!npsn || npsn.length < 8) {
        return redirect('/onboarding?message=' + encodeURIComponent('NPSN wajib diisi (8 digit).') + '&type=error')
    }

    if (!schoolName) {
        return redirect('/onboarding?message=' + encodeURIComponent('Nama sekolah wajib diisi.') + '&type=error')
    }

    const adminSupabase = createAdminClient()

    // Check if school with this NPSN already exists
    const { data: existingSchool } = await adminSupabase
        .from('schools')
        .select('id, name')
        .eq('npsn', npsn)
        .maybeSingle()

    if (existingSchool) {
        return redirect('/onboarding?message=' + encodeURIComponent('Sekolah dengan NPSN ' + npsn + ' sudah terdaftar (' + existingSchool.name + '). Hubungi Admin sekolah tersebut untuk mendapatkan kode undangan.') + '&type=error')
    }

    // Create the school with NPSN
    const { data: school, error: schoolError } = await adminSupabase
        .from('schools')
        .insert({
            name: schoolName,
            address: schoolAddress || null,
            city: schoolCity || null,
            npsn: npsn,
        })
        .select()
        .single()

    if (schoolError) {
        console.error('Create School Error:', schoolError)
        return redirect('/onboarding?message=' + encodeURIComponent('Gagal membuat sekolah: ' + schoolError.message) + '&type=error')
    }

    // Update the user's profile with school_id and make them admin
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .update({
            school_id: school.id,
            role: 'admin',
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Profile Update Error:', profileError)
        return redirect('/onboarding?message=' + encodeURIComponent('Sekolah dibuat, tetapi gagal mengaitkan profil.') + '&type=error')
    }

    // Initialize base data from template
    await initializeSchoolData(school.id, user.id);

    return redirect('/?message=' + encodeURIComponent('Selamat! Sekolah "' + schoolName + '" berhasil didaftarkan. Data dasar telah disiapkan. Anda menjadi Admin.') + '&type=success')
}

/**
 * Initializes a new school with base data copied from a template school.
 * This ensures new schools have categories, classes, and bases to start with.
 */
async function initializeSchoolData(newSchoolId: string, creatorId: string) {
    const adminSupabase = createAdminClient();

    // TEMPLATE_SCHOOL_ID is the 'admin' school (Madrasah Tsanawiyah Negeri 1 Pacitan)
    const TEMPLATE_SCHOOL_ID = 'e62b1c6b-f2d7-4591-97be-492f794df156';
    // Use the same template for everything
    const TEMPLATE_BASES_SCHOOL_ID = 'e62b1c6b-f2d7-4591-97be-492f794df156';

    console.log(`Initializing master data for school ${newSchoolId} (Creator: ${creatorId})`);

    try {
        // 1. Copy Categories
        const { data: cats } = await adminSupabase
            .from('report_categories')
            .select('name, rhk_label, is_teaching')
            .eq('school_id', TEMPLATE_SCHOOL_ID);

        if (cats && cats.length > 0) {
            console.log(`Copying ${cats.length} categories...`);
            const catRecords = cats.map(c => ({
                ...c,
                school_id: newSchoolId,
                user_id: creatorId
            }));
            await adminSupabase.from('report_categories').insert(catRecords);
        }

        // 2. Copy Class Rooms
        const { data: classes } = await adminSupabase
            .from('class_rooms')
            .select('name')
            .eq('school_id', TEMPLATE_SCHOOL_ID);

        if (classes && classes.length > 0) {
            const classRecords = classes.map(c => ({
                ...c,
                school_id: newSchoolId,
                user_id: creatorId
            }));
            await adminSupabase.from('class_rooms').insert(classRecords);
        }

        // 3. Copy Implementation Bases
        const { data: bases } = await adminSupabase
            .from('implementation_bases')
            .select('name')
            .eq('school_id', TEMPLATE_BASES_SCHOOL_ID);

        if (bases && bases.length > 0) {
            const baseRecords = bases.map(b => ({
                ...b,
                school_id: newSchoolId,
                user_id: creatorId
            }));
            await adminSupabase.from('implementation_bases').insert(baseRecords);
        }

        console.log('Master data initialization completed successfully.');
    } catch (error) {
        console.error('Failed to initialize school master data:', error);
        // We don't throw here to avoid failing the whole school creation 
        // if just seeding fails, but it's important to log it.
    }
}

export async function joinSchool(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const inviteCode = (formData.get('invite_code') as string)?.trim()?.toLowerCase()

    if (!inviteCode) {
        return redirect('/onboarding?tab=join&message=' + encodeURIComponent('Kode undangan wajib diisi.') + '&type=error')
    }

    const adminSupabase = createAdminClient()

    // Find the school by invite code
    const { data: school, error: schoolError } = await adminSupabase
        .from('schools')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .eq('is_active', true)
        .maybeSingle()

    if (schoolError || !school) {
        return redirect('/onboarding?tab=join&message=' + encodeURIComponent('Kode undangan tidak valid atau sekolah tidak aktif.') + '&type=error')
    }

    // Update the user's profile with the school_id
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .update({
            school_id: school.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Join School Error:', profileError)
        return redirect('/onboarding?tab=join&message=' + encodeURIComponent('Gagal bergabung ke sekolah.') + '&type=error')
    }

    return redirect('/?message=' + encodeURIComponent('Berhasil bergabung ke "' + school.name + '"!') + '&type=success')
}
