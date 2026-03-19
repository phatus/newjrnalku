'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getHolidays() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .order('holiday_date', { ascending: true });

  if (error) {
    console.error('Error fetching holidays:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Helper function to get holidays for a specific date range
export async function getHolidaysForMonth(year: number, month: number) {
  const supabase = await createClient();

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .gte('holiday_date', startDate)
    .lt('holiday_date', endDate)
    .order('holiday_date', { ascending: true });

  if (error) {
    console.error('Error fetching holidays for month:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createHoliday(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/');
  }

  const holiday_date = formData.get('holiday_date') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const is_national = formData.get('is_national') === 'true';

  if (!holiday_date || !name) {
    return { success: false, error: 'Date and name are required' };
  }

  const { error } = await supabase
    .from('holidays')
    .insert({
      holiday_date,
      name,
      description: description || null,
      is_national,
      created_by: user.id
    });

  if (error) {
    console.error('Error creating holiday:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/activities/holidays');
  revalidatePath('/activities/schedule');
  return { success: true, error: null };
}

export async function updateHoliday(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/');
  }

  const id = formData.get('id') as string;
  const holiday_date = formData.get('holiday_date') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const is_national = formData.get('is_national');

  if (!id || !holiday_date || !name) {
    return { success: false, error: 'ID, date, and name are required' };
  }

  const { error } = await supabase
    .from('holidays')
    .update({
      holiday_date,
      name,
      description: description || null,
      is_national: is_national === 'true',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating holiday:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/activities/holidays');
  revalidatePath('/activities/schedule');
  return { success: true, error: null };
}

export async function deleteHoliday(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/');
  }

  const id = formData.get('id') as string;

  if (!id) {
    return { success: false, error: 'ID is required' };
  }

  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting holiday:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/activities/holidays');
  revalidatePath('/activities/schedule');
  return { success: true, error: null };
}
