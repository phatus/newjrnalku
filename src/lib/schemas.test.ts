import { describe, it, expect } from 'vitest';
import { ActivitySchema, CategorySchema } from './schemas';

describe('ActivitySchema', () => {
    it('should validate a correct activity', () => {
        const data = {
            activity_date: '2024-03-05',
            category_id: '123',
            description: 'Melaksanakan pembelajaran di kelas',
        };
        const result = ActivitySchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it('should fail if description is too short', () => {
        const data = {
            activity_date: '2024-03-05',
            category_id: '123',
            description: 'Hi',
        };
        const result = ActivitySchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Deskripsi terlalu pendek (min. 3 karakter)");
        }
    });

    it('should transform student_count from string to number', () => {
        const data = {
            activity_date: '2024-03-05',
            category_id: '123',
            description: 'Valid description',
            student_count: '32'
        };
        const result = ActivitySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.student_count).toBe(32);
        }
    });
});

describe('CategorySchema', () => {
    it('should validate a correct category', () => {
        const data = {
            name: 'Kategori Baru',
            rhk_label: 'Label RHK',
            is_teaching: true
        };
        const result = CategorySchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it('should provide default for is_teaching', () => {
        const data = {
            name: 'Kategori Baru',
            rhk_label: 'Label RHK'
        };
        const result = CategorySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.is_teaching).toBe(false);
        }
    });
});
