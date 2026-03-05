import { z } from 'zod';

export const ActivitySchema = z.object({
    activity_date: z.string().min(1, "Tanggal kegiatan wajib diisi"),
    category_id: z.string().min(1, "Kategori wajib dipilih"),
    description: z.string().min(3, "Deskripsi terlalu pendek (min. 3 karakter)"),
    implementation_basis_id: z.string().optional().nullable(),
    evidence_link: z.string().optional().nullable(),
    teaching_hours: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    student_outcome: z.string().optional().nullable(),
    student_count: z.union([z.string(), z.number()]).optional().nullable().transform(val => {
        if (!val) return null;
        const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
        return isNaN(parsed) ? null : parsed;
    }),
    class_room_ids: z.string().optional().nullable(),
});

export const CategorySchema = z.object({
    name: z.string().min(3, "Nama kategori minimal 3 karakter"),
    rhk_label: z.string().min(3, "Label RHK minimal 3 karakter"),
    is_teaching: z.boolean().default(false),
});

export const MasterDataSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
});

export type ActivityInput = z.infer<typeof ActivitySchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type MasterDataInput = z.infer<typeof MasterDataSchema>;
