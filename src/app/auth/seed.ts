'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function seedInitialData(formData: FormData) {
    const supabase = await createClient()

    // 1. Seed Categories
    const categories = [
        { name: 'Kegiatan Belajar Mengajar (KBM)', rhk_label: 'Proses Pembelajaran', is_teaching: true },
        { name: 'Administrasi Kurikulum', rhk_label: 'Administrasi Sekolah', is_teaching: false },
        { name: 'Pengembangan Diri (Pelatihan)', rhk_label: 'Kompetensi Guru', is_teaching: false },
        { name: 'Tugas Tambahan (Wali Kelas)', rhk_label: 'Tugas Tambahan', is_teaching: false },
        { name: 'Kegiatan Ekstrakurikuler', rhk_label: 'Kesiswaan', is_teaching: false },
    ]

    const { error: catError } = await supabase.from('report_categories').upsert(categories, { onConflict: 'name' })

    // 2. Seed Class Rooms
    const classes = [
        { name: 'X RPL 1' }, { name: 'X RPL 2' },
        { name: 'XI RPL 1' }, { name: 'XI RPL 2' },
        { name: 'XII RPL 1' }, { name: 'XII RPL 2' },
    ]
    const { error: classError } = await supabase.from('class_rooms').upsert(classes, { onConflict: 'name' })

    // 3. Seed Implementation Bases
    const bases = [
        { name: 'SK Pembagian Tugas Mengajar' },
        { name: 'Surat Tugas Kepala Sekolah' },
        { name: 'Program Kerja Sekolah' },
    ]
    const { error: baseError } = await supabase.from('implementation_bases').upsert(bases, { onConflict: 'name' })

    if (catError || classError || baseError) {
        console.error('Seed Error:', { catError, classError, baseError })
        return { success: false, error: 'Gagal melakukan seeding data.' }
    }

    revalidatePath('/activities/create')
    return { success: true }
}
