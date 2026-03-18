import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { initializeSchoolData } from '@/app/onboarding/actions';

vi.mock('@/utils/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

import { createAdminClient } from '@/utils/supabase/admin';

const TEMPLATE_SCHOOL_ID = 'e62b1c6b-f2d7-4591-97be-492f794df156';

describe('initializeSchoolData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should run full initialization flow', async () => {
        // Create a reusable mock builder
        const mockInsert = vi.fn().mockResolvedValue({});
        const mockBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
                data: [{ name: 'Test', rhk_label: 'RHK', is_teaching: true }],
                error: null,
            }),
            insert: mockInsert,
        };

        const mockSupabase = { from: vi.fn().mockReturnValue(mockBuilder) };
        (createAdminClient as Mock).mockReturnValue(mockSupabase);

        await initializeSchoolData('school-123', 'user-456');

        // Logs
        expect(console.log).toHaveBeenCalledWith(
            'Initializing master data for school school-123 (Creator: user-456)'
        );
        expect(console.log).toHaveBeenCalledWith(
            'Master data initialization completed successfully.'
        );

        // Queries: from called 6 times (select + insert for each of 3 tables)
        expect(mockSupabase.from).toHaveBeenCalledTimes(6);
        expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'report_categories'); // select
        expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'report_categories'); // insert
        expect(mockSupabase.from).toHaveBeenNthCalledWith(3, 'class_rooms'); // select
        expect(mockSupabase.from).toHaveBeenNthCalledWith(4, 'class_rooms'); // insert
        expect(mockSupabase.from).toHaveBeenNthCalledWith(5, 'implementation_bases'); // select
        expect(mockSupabase.from).toHaveBeenNthCalledWith(6, 'implementation_bases'); // insert

        // Select called with correct fields for categories
        expect(mockBuilder.select).toHaveBeenCalledWith('name, rhk_label, is_teaching');

        // eq called with template school ID multiple times
        const eqCalls = (mockBuilder.eq as any).mock.calls;
        expect(eqCalls.length).toBeGreaterThanOrEqual(3);
        expect(eqCalls[0]).toEqual(['school_id', TEMPLATE_SCHOOL_ID]);

        // Insert called at least once (categories will have data)
        expect(mockInsert).toHaveBeenCalled();

        // Verify data transformation: inserted records should have school_id & user_id overwritten
        const insertArg = (mockInsert as any).mock.calls[0][0];
        expect(insertArg[0]).toMatchObject({
            name: 'Test',
            school_id: 'school-123',
            user_id: 'user-456',
        });
    });

    it('should handle empty data sets (no inserts)', async () => {
        const mockBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            insert: vi.fn(),
        };
        const mockSupabase = { from: vi.fn().mockReturnValue(mockBuilder) };
        (createAdminClient as Mock).mockReturnValue(mockSupabase);

        await initializeSchoolData('school-123', 'user-456');

        expect(mockSupabase.from).toHaveBeenCalledTimes(3); // only select calls (no insert when data is empty)
        expect(mockBuilder.insert).not.toHaveBeenCalled();
    });

    it('should log error and continue when query fails', async () => {
        const mockBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockRejectedValue(new Error('DB error')),
            insert: vi.fn(),
        };
        const mockSupabase = { from: vi.fn().mockReturnValue(mockBuilder) };
        (createAdminClient as Mock).mockReturnValue(mockSupabase);

        await initializeSchoolData('school-123', 'user-456');

        expect(console.error).toHaveBeenCalledWith(
            'Failed to initialize school master data:',
            expect.any(Error)
        );
    });

    it('should log error and continue when insert fails', async () => {
        const mockBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
                data: [{ name: 'Test', rhk_label: 'RHK', is_teaching: true }],
                error: null,
            }),
            insert: vi.fn().mockRejectedValue(new Error('Insert failed')),
        };
        const mockSupabase = { from: vi.fn().mockReturnValue(mockBuilder) };
        (createAdminClient as Mock).mockReturnValue(mockSupabase);

        await initializeSchoolData('school-123', 'user-456');

        expect(console.error).toHaveBeenCalledWith(
            'Failed to initialize school master data:',
            expect.any(Error)
        );
    });

    it('should preserve template ID fields in other properties', async () => {
        const templateRecord = {
            id: 'rec-123',
            name: 'KBM',
            rhk_label: 'RHK',
            is_teaching: true,
            created_at: '2024-01-01',
            school_id: TEMPLATE_SCHOOL_ID,
        };

        const mockInsert = vi.fn().mockResolvedValue({});
        const mockBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [templateRecord], error: null }),
            insert: mockInsert,
        };
        const mockSupabase = { from: vi.fn().mockReturnValue(mockBuilder) };
        (createAdminClient as Mock).mockReturnValue(mockSupabase);

        await initializeSchoolData('new-school-123', 'user-456');

        const inserted = (mockInsert as any).mock.calls[0][0];
        expect(inserted[0].id).toBe('rec-123');
        expect(inserted[0].created_at).toBe('2024-01-01');
        expect(inserted[0].school_id).toBe('new-school-123'); // overwritten
        expect(inserted[0].user_id).toBe('user-456'); // added
    });

    it('should handle null fields in template data', async () => {
        const mockInsert = vi.fn().mockResolvedValue({});
        const mockBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
                data: [{ name: 'Cat', rhk_label: null, is_teaching: true }],
                error: null,
            }),
            insert: mockInsert,
        };
        const mockSupabase = { from: vi.fn().mockReturnValue(mockBuilder) };
        (createAdminClient as Mock).mockReturnValue(mockSupabase);

        await initializeSchoolData('new-school-123', 'user-456');

        const inserted = (mockInsert as any).mock.calls[0][0];
        expect(inserted[0].rhk_label).toBeNull();
        expect(inserted[0].school_id).toBe('new-school-123');
    });
});
