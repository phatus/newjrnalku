'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}&type=error`)
    }

    return redirect('/')
}

export async function register(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return redirect(`/register?message=${encodeURIComponent(error.message)}&type=error`)
    }

    if (data.user) {
        // Insert profile manually since we don't have a DB trigger yet
        const adminSupabase = createAdminClient()
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .insert({
                id: data.user.id,
                name: fullName,
                role: 'user'
            })

        if (profileError) {
            console.error('Profile Creation Error:', profileError)
        }
    }

    return redirect('/login?message=' + encodeURIComponent('Pendaftaran berhasil! Silakan periksa email Anda atau langsung masuk.') + '&type=success')
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const name = formData.get('name') as string
    const nip = formData.get('nip') as string
    const pangkat_gol = formData.get('pangkat_gol') as string
    const jabatan = formData.get('jabatan') as string
    const unit_kerja = formData.get('unit_kerja') as string
    const subject = formData.get('subject') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            name,
            nip,
            pangkat_gol,
            jabatan,
            unit_kerja,
            subject,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update Profile Error:', error)
        return redirect('/profile?message=' + encodeURIComponent('Gagal memperbarui profil.') + '&type=error')
    }

    revalidatePath('/profile')
    return redirect('/profile?message=' + encodeURIComponent('Profil berhasil diperbarui!') + '&type=success')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
