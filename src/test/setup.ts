import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    revalidatePath: vi.fn(),
}))

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

vi.mock('@/utils/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}))
