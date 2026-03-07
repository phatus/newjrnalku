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

    return redirect('/confirm-email')
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
    const avatar_url = formData.get('avatar_url') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            name,
            nip,
            pangkat_gol,
            jabatan,
            unit_kerja,
            subject,
            avatar_url,
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

export async function updatePreferences(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const report_notifications = formData.get('report_notifications') === 'on'
    const theme = formData.get('theme') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            report_notifications,
            theme,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update Preferences Error:', error)
        return redirect('/profile/preferences?message=' + encodeURIComponent('Gagal memperbarui preferensi.') + '&type=error')
    }

    revalidatePath('/profile')
    return redirect('/profile?message=' + encodeURIComponent('Preferensi berhasil disimpan!') + '&type=success')
}

export async function changePassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password !== confirmPassword) {
        return redirect('/profile/change-password?message=' + encodeURIComponent('Konfirmasi kata sandi tidak cocok.') + '&type=error')
    }

    if (password.length < 6) {
        return redirect('/profile/change-password?message=' + encodeURIComponent('Kata sandi minimal 6 karakter.') + '&type=error')
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Change Password Error:', error)
        return redirect('/profile/change-password?message=' + encodeURIComponent('Gagal mengubah kata sandi: ' + error.message) + '&type=error')
    }

    return redirect('/profile?message=' + encodeURIComponent('Kata sandi berhasil diperbarui!') + '&type=success')
}

export async function updateAvatarOnly(avatar_url: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profiles')
        .update({
            avatar_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update Avatar Error:', error)
        throw error
    }

    revalidatePath('/profile')
    revalidatePath('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
