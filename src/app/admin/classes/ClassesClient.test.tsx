import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/app/admin/actions', () => ({
    createClass: vi.fn(() => Promise.resolve({ success: true })),
    deleteClass: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@/lib/utils', () => ({
    cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}));

import ClassesClient from '@/app/admin/classes/ClassesClient';
import { createClass, deleteClass } from '@/app/admin/actions';

const mockClasses = [
    { id: 1, name: 'X RPL 1' },
    { id: 2, name: 'X RPL 2' },
    { id: 3, name: 'XI RPL 1' },
];

describe('ClassesClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        delete (window as any).location;
        window.location = { reload: vi.fn() } as any;
    });

    it('renders classes list correctly', () => {
        render(<ClassesClient initialClasses={mockClasses} />);

        expect(screen.getByText('Daftar Kelas')).toBeInTheDocument();
        expect(screen.getByText('Kelola data kelas siswa.')).toBeInTheDocument();
        expect(screen.getByText('Nama Kelas')).toBeInTheDocument();
        expect(screen.getByText('Aksi')).toBeInTheDocument();

        expect(screen.getByText('X RPL 1')).toBeInTheDocument();
        expect(screen.getByText('X RPL 2')).toBeInTheDocument();
        expect(screen.getByText('XI RPL 1')).toBeInTheDocument();
    });

    it('shows add form when Tambah Kelas clicked', async () => {
        const user = userEvent.setup();
        render(<ClassesClient initialClasses={mockClasses} />);

        await user.click(screen.getByText('Tambah Kelas'));

        await waitFor(() => {
            expect(screen.getByText('Tambah Kelas Baru')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Contoh: X RPL 1')).toBeInTheDocument();
            expect(screen.getByText('Simpan Kelas')).toBeInTheDocument();
        });
    });

    it('closes add form with X button', async () => {
        const user = userEvent.setup();
        render(<ClassesClient initialClasses={mockClasses} />);

        await user.click(screen.getByText('Tambah Kelas'));

        await waitFor(() => {
            expect(screen.getByText('Tambah Kelas Baru')).toBeInTheDocument();
        });

        // Find X button (close)
        const buttons = screen.getAllByRole('button');
        const closeButton = buttons.find(btn =>
            btn.textContent === '' && btn.querySelector('svg')
        );
        if (closeButton) {
            await user.click(closeButton);
        }

        await waitFor(() => {
            expect(screen.queryByText('Tambah Kelas Baru')).not.toBeInTheDocument();
        });
    });

    it('submits add form successfully', async () => {
        const user = userEvent.setup();
        render(<ClassesClient initialClasses={mockClasses} />);

        await user.click(screen.getByText('Tambah Kelas'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Contoh: X RPL 1')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Contoh: X RPL 1');
        await user.type(input, 'XII RPL 3');

        const submitButton = screen.getByText('Simpan Kelas');
        await user.click(submitButton);

        await waitFor(() => {
            expect(createClass).toHaveBeenCalled();
        });
    });

    it('deletes class with confirmation', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<ClassesClient initialClasses={mockClasses} />);

        // Get delete button from first row
        const firstRow = screen.getByText('X RPL 1').closest('tr');
        expect(firstRow).toBeInTheDocument();
        const deleteButton = firstRow?.querySelector('button');
        expect(deleteButton).toBeInTheDocument();

        await user.click(deleteButton!);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledWith('Hapus kelas ini?');
        });

        await waitFor(() => {
            expect(deleteClass).toHaveBeenCalledWith(1);
        });

        // Class removed from view
        await waitFor(() => {
            expect(screen.queryByText('X RPL 1')).not.toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });

    it('does not delete when cancelled', async () => {
        const user = userEvent.setup();
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(<ClassesClient initialClasses={mockClasses} />);

        const firstRow = screen.getByText('X RPL 1').closest('tr');
        const deleteButton = firstRow?.querySelector('button');

        if (deleteButton) {
            await user.click(deleteButton);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(deleteClass).not.toHaveBeenCalled();

        (window.confirm as any).mockRestore();
    });

    it('shows loading state during delete', async () => {
        const user = userEvent.setup();
        const slowDelete = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
        // Override the mock
        (deleteClass as any).mockImplementation(slowDelete);

        render(<ClassesClient initialClasses={mockClasses} />);

        const firstRow = screen.getByText('X RPL 1').closest('tr');
        const deleteButton = firstRow?.querySelector('button');

        if (deleteButton) {
            await user.click(deleteButton);
        }

        // Spinner should appear
        await waitFor(() => {
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    it('handles empty classes list', () => {
        render(<ClassesClient initialClasses={[]} />);

        expect(screen.getByText('Daftar Kelas')).toBeInTheDocument();
        expect(screen.getByText('Nama Kelas')).toBeInTheDocument();

        // No rows in table body
        const rows = document.querySelectorAll('tbody tr');
        expect(rows.length).toBe(0);
    });

    it('displays class names in table', () => {
        render(<ClassesClient initialClasses={mockClasses} />);

        const rows = document.querySelectorAll('tbody tr');
        expect(rows.length).toBe(3);

        // Verify each class name is present
        mockClasses.forEach(cls => {
            expect(screen.getByText(cls.name)).toBeInTheDocument();
        });
    });

    it('has proper table structure', () => {
        render(<ClassesClient initialClasses={mockClasses} />);

        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        const headers = screen.getAllByRole('columnheader');
        expect(headers.length).toBe(2);
    });
});
