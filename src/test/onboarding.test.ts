import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { createSchool, joinSchool } from '@/app/onboarding/actions';
import { redirect } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

// Mock supabase clients
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

// Mock initializeSchoolData BEFORE importing the module
vi.mock('@/app/onboarding/actions', async () => {
    const actual = await vi.importActual('@/app/onboarding/actions');

    return {
        ...actual,
        initializeSchoolData: vi.fn().mockResolvedValue(undefined),
    };
});

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { initializeSchoolData } from '@/app/onboarding/actions';

const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockSchool = { id: 'school-123', name: 'Sekolah Test' };

describe('Onboarding Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (redirect as any).mockClear();
        (initializeSchoolData as any).mockClear();
    });

    describe('createSchool', () => {
        it('should throw Unauthorized when user is not authenticated', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', 'Sekolah Test');

            await expect(createSchool(formData)).rejects.toThrow('Unauthorized');
        });

        it('should redirect with error when NPSN is too short', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const formData = new FormData();
            formData.set('npsn', '1234');

            await createSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?message=' + encodeURIComponent('NPSN wajib diisi (8 digit).') + '&type=error'
            );
        });

        it('should redirect with error when school name is empty', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');

            await createSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?message=' + encodeURIComponent('Nama sekolah wajib diisi.') + '&type=error'
            );
        });

        it('should redirect with error when school with NPSN already exists', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'existing-school', name: 'Sek Lama' },
                }),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', 'Sekolah Baru');

            await createSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?message=' + encodeURIComponent('Sekolah dengan NPSN 12345678 sudah terdaftar (Sek Lama). Hubungi Admin sekolah tersebut untuk mendapatkan kode undangan.') + '&type=error'
            );
        });

        it('should create school successfully and initialize data', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                insert: vi.fn().mockReturnThis(),
                update: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockSchool,
                    error: null,
                }),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', 'Sekolah Test Baru');
            formData.set('school_address', 'Jl. Test');
            formData.set('school_city', 'Jakarta');

            await createSchool(formData);

            expect(createAdminClient).toHaveBeenCalled();
            expect(mockAdminSupabase.insert).toHaveBeenCalledWith({
                name: 'Sekolah Test Baru',
                address: 'Jl. Test',
                city: 'Jakarta',
                npsn: '12345678',
            });
            expect(mockAdminSupabase.update).toHaveBeenCalledWith({
                school_id: 'school-123',
                role: 'admin',
                updated_at: expect.any(String),
            });
            expect(redirect).toHaveBeenCalledWith(
                '/?message=' + encodeURIComponent('Selamat! Sekolah "Sekolah Test Baru" berhasil didaftarkan. Data dasar telah disiapkan. Anda menjadi Admin.') + '&type=success'
            );
        });

        it('should handle school creation database error', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' },
                }),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', 'Sekolah Test');

            await createSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?message=' + encodeURIComponent('Gagal membuat sekolah: Database error') + '&type=error'
            );
        });

        it('should handle profile update error', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockSchool,
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            mockAdminSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    error: { message: 'Profile update failed' },
                }),
            });

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', 'Sekolah Test');

            await createSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?message=' + encodeURIComponent('Sekolah dibuat, tetapi gagal mengaitkan profil.') + '&type=error'
            );
        });

        it('should use manual fields when primary fields are empty', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockSchool,
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', '');
            formData.set('school_name_manual', 'Sekolah Manual');

            await createSchool(formData);

            expect(mockAdminSupabase.insert).toHaveBeenCalledWith({
                name: 'Sekolah Manual',
                address: null,
                city: null,
                npsn: '12345678',
            });
        });

        it('should handle null address and city', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockSchool,
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('npsn', '12345678');
            formData.set('school_name', 'Sekolah Tanpa Alamat');

            await createSchool(formData);

            expect(mockAdminSupabase.insert).toHaveBeenCalledWith({
                name: 'Sekolah Tanpa Alamat',
                address: null,
                city: null,
                npsn: '12345678',
            });
        });

        it('should trim whitespace from fields', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockSchool,
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('npsn', '  12345678  ');
            formData.set('school_name', '  Sekolah Spaced  ');

            await createSchool(formData);

            expect(mockAdminSupabase.insert).toHaveBeenCalledWith({
                name: 'Sekolah Spaced',
                address: null,
                city: null,
                npsn: '12345678',
            });
        });

    });

    describe('joinSchool', () => {
        it('should throw Unauthorized when user is not authenticated', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const formData = new FormData();
            formData.set('invite_code', 'abc123');

            await expect(joinSchool(formData)).rejects.toThrow('Unauthorized');
        });

        it('should redirect with error when invite code is empty', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const formData = new FormData();

            await joinSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?tab=join&message=' + encodeURIComponent('Kode undangan wajib diisi.') + '&type=error'
            );
        });

        it('should redirect with error when invite code is invalid', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            const formData = new FormData();
            formData.set('invite_code', 'invalidcode');

            await joinSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?tab=join&message=' + encodeURIComponent('Kode undangan tidak valid atau sekolah tidak aktif.') + '&type=error'
            );
        });

        it('should join school successfully', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'school-123', name: 'Sekolah Join' },
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);
            mockAdminSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            const formData = new FormData();
            formData.set('invite_code', 'valid123');

            await joinSchool(formData);

            // Verify school lookup
            expect(mockAdminSupabase.select).toHaveBeenCalledWith('id, name');
            expect(mockAdminSupabase.eq).toHaveBeenCalledWith('invite_code', 'valid123');
            expect(mockAdminSupabase.eq).toHaveBeenCalledWith('is_active', true);

            // Verify profile update
            expect(mockAdminSupabase.update).toHaveBeenCalledWith({
                school_id: 'school-123',
                updated_at: expect.any(String),
            });

            expect(redirect).toHaveBeenCalledWith(
                '/?message=' + encodeURIComponent('Berhasil bergabung ke "Sekolah Join"!') + '&type=success'
            );
        });

        it('should handle profile update error when joining', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'school-123', name: 'Sekolah Join' },
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);

            mockAdminSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    error: { message: 'Cannot update profile' },
                }),
            });

            const formData = new FormData();
            formData.set('invite_code', 'valid123');

            await joinSchool(formData);

            expect(redirect).toHaveBeenCalledWith(
                '/onboarding?tab=join&message=' + encodeURIComponent('Gagal bergabung ke sekolah.') + '&type=error'
            );
        });

        it('should lowercase invite code before lookup', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'school-123', name: 'Sekolah Join' },
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);
            mockAdminSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            const formData = new FormData();
            formData.set('invite_code', 'UPPERCASE123');

            await joinSchool(formData);

            const eqCalls = mockAdminSupabase.eq as any;
            const inviteCodeCall = eqCalls.mock.calls.find((call: any[]) => call[0] === 'invite_code');
            expect(inviteCodeCall[1]).toBe('uppercase123');
        });

        it('should trim whitespace from invite code', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'school-123', name: 'Sekolah Join' },
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);
            mockAdminSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            const formData = new FormData();
            formData.set('invite_code', '  spaced123  ');

            await joinSchool(formData);

            const eqCalls = mockAdminSupabase.eq as any;
            const inviteCodeCall = eqCalls.mock.calls.find((call: any[]) => call[0] === 'invite_code');
            expect(inviteCodeCall[1]).toBe('spaced123');
        });

        it('should filter by is_active=true for school lookup', async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
                },
            };
            (createClient as any).mockResolvedValue(mockSupabase);

            const mockAdminSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'school-123', name: 'Sekolah Join' },
                    error: null,
                }),
                update: vi.fn().mockReturnThis(),
            };
            (createAdminClient as any).mockReturnValue(mockAdminSupabase);
            mockAdminSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            const formData = new FormData();
            formData.set('invite_code', 'test123');

            await joinSchool(formData);

            const eqCalls = mockAdminSupabase.eq as any;
            expect(eqCalls.mock.calls.length).toBeGreaterThanOrEqual(2);
            expect(eqCalls.mock.calls).toContainEqual(['invite_code', 'test123']);
            expect(eqCalls.mock.calls).toContainEqual(['is_active', true]);
        });
    });
});
