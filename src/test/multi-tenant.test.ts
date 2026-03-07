import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// --- Mock Supabase clients ---
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockIn = vi.fn();
const mockHead = vi.fn();

const chainMock = () => ({
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    in: mockIn.mockReturnThis(),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
    order: mockOrder.mockReturnThis(),
});

const mockSupabaseClient = {
    from: mockFrom.mockImplementation(() => chainMock()),
    auth: { getUser: vi.fn() }
};

const mockAdminClient = {
    from: mockFrom.mockImplementation(() => chainMock()),
};

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock('@/utils/supabase/admin', () => ({
    createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Multi-Tenant: Onboarding Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createSchool', () => {
        it('should redirect with error when school name is empty', async () => {
            // Setup user auth
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-1' } }
            });

            const { createSchool } = await import('@/app/onboarding/actions');

            const formData = new FormData();
            formData.set('school_name', '');
            formData.set('school_address', '');

            await expect(createSchool(formData)).rejects.toThrow('REDIRECT');
        });

        it('should redirect with error when user is not authenticated', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null }
            });

            const { createSchool } = await import('@/app/onboarding/actions');

            const formData = new FormData();
            formData.set('school_name', 'Test School');

            await expect(createSchool(formData)).rejects.toThrow('Unauthorized');
        });
    });

    describe('joinSchool', () => {
        it('should redirect with error when invite code is empty', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-1' } }
            });

            const { joinSchool } = await import('@/app/onboarding/actions');

            const formData = new FormData();
            formData.set('invite_code', '');

            await expect(joinSchool(formData)).rejects.toThrow('REDIRECT');
        });

        it('should redirect with error when user is not authenticated', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null }
            });

            const { joinSchool } = await import('@/app/onboarding/actions');

            const formData = new FormData();
            formData.set('invite_code', 'abc123');

            await expect(joinSchool(formData)).rejects.toThrow('Unauthorized');
        });
    });
});

describe('Multi-Tenant: Schema Validation', () => {
    it('MasterDataSchema should validate correct data', async () => {
        const { MasterDataSchema } = await import('@/lib/schemas');
        const result = MasterDataSchema.safeParse({ name: 'Test Item' });
        expect(result.success).toBe(true);
    });

    it('MasterDataSchema should reject short names', async () => {
        const { MasterDataSchema } = await import('@/lib/schemas');
        const result = MasterDataSchema.safeParse({ name: 'Hi' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Nama minimal 3 karakter");
        }
    });

    it('ActivitySchema should accept optional fields as null', async () => {
        const { ActivitySchema } = await import('@/lib/schemas');
        const result = ActivitySchema.safeParse({
            activity_date: '2024-03-05',
            category_id: '123',
            description: 'Valid activity',
            implementation_basis_id: null,
            evidence_link: null,
            teaching_hours: null,
            topic: null,
            student_outcome: null,
            student_count: null,
            class_room_ids: null,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.student_count).toBeNull();
        }
    });

    it('ActivitySchema should reject empty category_id', async () => {
        const { ActivitySchema } = await import('@/lib/schemas');
        const result = ActivitySchema.safeParse({
            activity_date: '2024-03-05',
            category_id: '',
            description: 'Valid description',
        });
        expect(result.success).toBe(false);
    });

    it('ActivitySchema should reject empty activity_date', async () => {
        const { ActivitySchema } = await import('@/lib/schemas');
        const result = ActivitySchema.safeParse({
            activity_date: '',
            category_id: '123',
            description: 'Valid description',
        });
        expect(result.success).toBe(false);
    });

    it('ActivitySchema should transform student_count number to number', async () => {
        const { ActivitySchema } = await import('@/lib/schemas');
        const result = ActivitySchema.safeParse({
            activity_date: '2024-03-05',
            category_id: '123',
            description: 'Valid description',
            student_count: 25,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.student_count).toBe(25);
        }
    });

    it('ActivitySchema should transform invalid student_count to null', async () => {
        const { ActivitySchema } = await import('@/lib/schemas');
        const result = ActivitySchema.safeParse({
            activity_date: '2024-03-05',
            category_id: '123',
            description: 'Valid description',
            student_count: 'not-a-number',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.student_count).toBeNull();
        }
    });

    it('CategorySchema should reject short rhk_label', async () => {
        const { CategorySchema } = await import('@/lib/schemas');
        const result = CategorySchema.safeParse({
            name: 'Test Category',
            rhk_label: 'AB',
        });
        expect(result.success).toBe(false);
    });
});

describe('Multi-Tenant: Date Utils Edge Cases', () => {
    it('should handle leap year date', async () => {
        const { parseActivityMonth } = await import('@/utils/date-utils');
        expect(parseActivityMonth('2024-02-29')).toBe(1); // February = month 1
    });

    it('should handle start-of-year', async () => {
        const { parseActivityMonth } = await import('@/utils/date-utils');
        expect(parseActivityMonth('2024-01-01')).toBe(0);
    });

    it('should handle end-of-year', async () => {
        const { parseActivityMonth } = await import('@/utils/date-utils');
        expect(parseActivityMonth('2024-12-31')).toBe(11);
    });

    it('calculateMonthlyCounts should return all zeros for empty array', async () => {
        const { calculateMonthlyCounts } = await import('@/utils/date-utils');
        const counts = calculateMonthlyCounts([]);
        expect(counts).toEqual(Array(12).fill(0));
        expect(counts.length).toBe(12);
    });

    it('calculateMonthlyCounts should ignore invalid dates', async () => {
        const { calculateMonthlyCounts } = await import('@/utils/date-utils');
        const counts = calculateMonthlyCounts([
            { activity_date: '' },
            { activity_date: 'invalid' },
            { activity_date: '2024-01-15' },
        ]);
        expect(counts[0]).toBe(1); // Only valid one
        expect(counts.reduce((a: number, b: number) => a + b, 0)).toBe(1);
    });
});
