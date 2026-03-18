"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CategorySchema, MasterDataSchema } from "@/lib/schemas";

// --- Categories ---

export async function getUserCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('report_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (error) throw error;
    return data;
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = Object.fromEntries(formData.entries());
    const validation = CategorySchema.safeParse({
        ...rawData,
        is_teaching: rawData.is_teaching === 'true'
    });

    if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
    }

    const { name, rhk_label, is_teaching } = validation.data;

    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();

    const { error } = await supabase.from('report_categories').insert({
        name,
        rhk_label,
        is_teaching,
        user_id: user.id,
        school_id: profile?.school_id
    });

    if (error) throw error;
    revalidatePath('/master-data/categories');
}

export async function updateCategory(id: number, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = Object.fromEntries(formData.entries());
    const validation = CategorySchema.safeParse({
        ...rawData,
        is_teaching: rawData.is_teaching === 'true'
    });

    if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
    }

    const { name, rhk_label, is_teaching } = validation.data;

    const { error } = await supabase.from('report_categories').update({
        name,
        rhk_label,
        is_teaching
    }).eq('id', id).eq('user_id', user.id);

    if (error) throw error;
    revalidatePath('/master-data/categories');
}

export async function deleteCategory(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from('report_categories').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    revalidatePath('/master-data/categories');
}

// --- Class Rooms ---

export async function getUserClassRooms() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('class_rooms')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (error) throw error;
    return data;
}

export async function createClassRoom(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = Object.fromEntries(formData.entries());
    const validation = MasterDataSchema.safeParse(rawData);

    if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
    }

    const { name } = validation.data;

    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();

    const { error } = await supabase.from('class_rooms').insert({
        name,
        user_id: user.id,
        school_id: profile?.school_id
    });

    if (error) throw error;
    revalidatePath('/master-data/classes');
}

export async function deleteClassRoom(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from('class_rooms').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    revalidatePath('/master-data/classes');
}

// --- Implementation Bases ---

export async function getUserBases() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('implementation_bases')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (error) throw error;
    return data;
}

export async function createBase(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = Object.fromEntries(formData.entries());
    const validation = MasterDataSchema.safeParse(rawData);

    if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
    }

    const { name } = validation.data;

    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();

    const { error } = await supabase.from('implementation_bases').insert({
        name,
        user_id: user.id,
        school_id: profile?.school_id
    });

    if (error) throw error;
    revalidatePath('/master-data/bases');
}

export async function deleteBase(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from('implementation_bases').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    revalidatePath('/master-data/bases');
}
