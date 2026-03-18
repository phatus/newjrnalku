import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock semua dependencies sebelum import component
vi.mock('@/app/admin/actions', () => ({
    createCategory: vi.fn(() => Promise.resolve({ success: true })),
    updateCategory: vi.fn(() => Promise.resolve({ success: true })),
    deleteCategory: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@/lib/utils', () => ({
    cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}));

import AdminCategoriesClient from '@/app/admin/categories/CategoriesClient';
import { createCategory, updateCategory, deleteCategory } from '@/app/admin/actions';

const mockCategories = [
    {
        id: 1,
        name: 'KBM Matematika',
        rhk_label: 'Terlaksananya pembelajaran matematika',
        is_teaching: true,
    },
    {
        id: 2,
        name: 'Non-KBM Penunjang',
        rhk_label: 'Kegiatan penunjang administrasi',
        is_teaching: false,
    },
    {
        id: 3,
        name: 'KBM IPA',
        rhk_label: 'Terlaksananya pembelajaran IPA',
        is_teaching: true,
    },
];

describe('AdminCategoriesClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        // Mock window.location.reload
        delete (window as any).location;
        window.location = { reload: vi.fn() } as any;

        // Mock window.alert
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('should render categories list', () => {
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        expect(screen.getByText('Kategori Laporan')).toBeInTheDocument();
        expect(screen.getByText('Kelola RHK dan kategori aktivitas guru.')).toBeInTheDocument();
        expect(screen.getByText('Nama Kategori')).toBeInTheDocument();
        expect(screen.getByText('Label RHK')).toBeInTheDocument();
        expect(screen.getByText('Status KBM')).toBeInTheDocument();
        expect(screen.getByText('Aksi')).toBeInTheDocument();

        // Category names
        expect(screen.getAllByText('KBM Matematika').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Non-KBM Penunjang')).toBeInTheDocument();
        expect(screen.getAllByText('KBM IPA').length).toBeGreaterThanOrEqual(1);
    });

    it('should display correct KBM status badges', () => {
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        expect(screen.getAllByText('Aktif').length).toBe(2); // Two teaching categories
        expect(screen.getAllByText('Biasa').length).toBe(1); // One non-teaching
    });

    it('should show add form when Tambah Kategori clicked', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        await user.click(screen.getByText('Tambah Kategori'));

        await waitFor(() => {
            expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument();
            // Check inputs by placeholder (labels not associated with inputs)
            expect(screen.getByPlaceholderText('Contoh: Pembelajaran')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Contoh: Terlaksananya pembelajaran...')).toBeInTheDocument();
            // Select doesn't have associated label, so query by role only
            expect(screen.getByRole('combobox')).toBeInTheDocument();
            expect(screen.getByText('Simpan Kategori')).toBeInTheDocument();
        });
    });

    it('should have correct select options in add form', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        await user.click(screen.getByText('Tambah Kategori'));

        await waitFor(() => {
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select).toBeInTheDocument();

            const options = select.querySelectorAll('option');
            expect(options.length).toBe(2);
            expect(options[0]).toHaveTextContent('Jurnal Mengajar (KBM)');
            expect(options[1]).toHaveTextContent('Kegiatan Biasa/Penunjang');
        });
    });

    it('should close add form with X button', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        await user.click(screen.getByText('Tambah Kategori'));

        await waitFor(() => {
            expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument();
        });

        // Find the X button in the add form (close button with no text)
        const buttons = screen.getAllByRole('button');
        const closeButton = buttons.find(btn =>
            btn.textContent === '' && btn.querySelector('svg')
        );
        if (closeButton) {
            await user.click(closeButton);
        }

        await waitFor(() => {
            expect(screen.queryByText('Tambah Kategori Baru')).not.toBeInTheDocument();
        });
    });

    it('should open edit form with correct data', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Edit Kategori')).toBeInTheDocument();
            expect(screen.getByText('Update Kategori')).toBeInTheDocument();

            const nameInput = screen.getByPlaceholderText('Contoh: Pembelajaran') as HTMLInputElement;
            expect(nameInput.value).toBe('KBM Matematika');

            const rhkInput = screen.getByPlaceholderText('Contoh: Terlaksananya pembelajaran...') as HTMLInputElement;
            expect(rhkInput.value).toBe('Terlaksananya pembelajaran matematika');
        });
    });

    it('should show delete confirmation dialog', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const deleteButtons = screen.getAllByTitle('Hapus kategori');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledWith('Hapus kategori ini?');
        });

        confirmSpy.mockRestore();
    });

    it('should call deleteCategory and remove from list', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const deleteButtons = screen.getAllByTitle('Hapus kategori');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledWith('Hapus kategori ini?');
        });

        await waitFor(() => {
            expect(deleteCategory).toHaveBeenCalledWith(1);
        });

        // Category should be removed from state
        await waitFor(() => {
            expect(screen.queryByText('KBM Matematika')).not.toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });

    it('should handle createCategory error and show error toast', async () => {
        const user = userEvent.setup();
        const { toast } = await import('sonner');
        const toastSpy = vi.mocked(toast.error);

        // Mock createCategory to fail
        (createCategory as Mock).mockRejectedValue(new Error('Database error'));

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        await user.click(screen.getByText('Tambah Kategori'));

        await waitFor(() => {
            expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument();
        });

        const nameInput = screen.getByPlaceholderText('Contoh: Pembelajaran');
        const rhkInput = screen.getByPlaceholderText('Contoh: Terlaksananya pembelajaran...');

        await user.type(nameInput, 'New Category');
        await user.type(rhkInput, 'New RHK');

        const submitButton = screen.getByText('Simpan Kategori');
        await user.click(submitButton);

        await waitFor(() => {
            expect(toastSpy).toHaveBeenCalledWith('Database error');
        });

        // Form should still be visible after error
        expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument();
    });

    it('should handle updateCategory error and show error toast', async () => {
        const user = userEvent.setup();
        const { toast } = await import('sonner');
        const toastSpy = vi.mocked(toast.error);

        // Mock updateCategory to fail
        (updateCategory as Mock).mockRejectedValue(new Error('Update failed'));

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        // Start editing
        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Edit Kategori')).toBeInTheDocument();
        });

        const submitButton = screen.getByText('Update Kategori');
        await user.click(submitButton);

        await waitFor(() => {
            expect(toastSpy).toHaveBeenCalledWith('Update failed');
        });

        // Edit form should still be visible after error
        expect(screen.getByText('Edit Kategori')).toBeInTheDocument();
    });

    it('should handle deleteCategory error and show error toast', async () => {
        const user = userEvent.setup();
        const { toast } = await import('sonner');
        const toastSpy = vi.mocked(toast.error);
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        // Mock deleteCategory to fail
        (deleteCategory as Mock).mockRejectedValue(new Error('Delete failed'));

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const deleteButtons = screen.getAllByTitle('Hapus kategori');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledWith('Hapus kategori ini?');
        });

        // Delete function will be called but will reject
        await waitFor(() => {
            expect(deleteCategory).toHaveBeenCalledWith(1);
        });

        // Category should NOT be removed from state after error
        await waitFor(() => {
            expect(screen.getByText('KBM Matematika')).toBeInTheDocument();
        });

        // Toast error should be shown
        expect(toastSpy).toHaveBeenCalledWith('Delete failed');

        confirmSpy.mockRestore();
    });

    it('should show loading state during delete', async () => {
        const user = userEvent.setup();
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        // Make deleteCategory slow but successful
        (deleteCategory as Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const deleteButtons = screen.getAllByTitle('Hapus kategori');
        await user.click(deleteButtons[0]);

        // After clicking delete, loadingId should be set immediately
        // Delete button should be disabled while operation is in progress
        await waitFor(() => {
            const deleteButtonsAfter = screen.getAllByTitle('Hapus kategori');
            expect(deleteButtonsAfter[0]).toBeDisabled();
        });

        // Wait for delete to complete
        await waitFor(() => {
            expect(deleteCategory).toHaveBeenCalled();
        });
    });

    it('should not allow adding when editing', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        // Start editing
        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Edit Kategori')).toBeInTheDocument();
        });

        // Try to click Tambah Kategori button - should be disabled
        const addButton = screen.getByText('Tambah Kategori');
        expect(addButton).toBeDisabled();
    });

    it('should toggle between add and edit modes properly', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        // Open add form
        await user.click(screen.getByText('Tambah Kategori'));
        await waitFor(() => {
            expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument();
        });

        // Click edit on a category
        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Edit Kategori')).toBeInTheDocument();
            expect(screen.getByText('Update Kategori')).toBeInTheDocument();
            expect(screen.queryByText('Tambah Kategori Baru')).not.toBeInTheDocument();
        });
    });

    it('should cancel edit and return to list', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Edit Kategori')).toBeInTheDocument();
        });

        const cancelButton = screen.getByText('Batal');
        await user.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Edit Kategori')).not.toBeInTheDocument();
            expect(screen.getByText('Kategori Laporan')).toBeInTheDocument();
        });
    });

    it('should display RHK labels correctly', () => {
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        expect(screen.getByText('Terlaksananya pembelajaran matematika')).toBeInTheDocument();
        expect(screen.getByText('Kegiatan penunjang administrasi')).toBeInTheDocument();
        expect(screen.getByText('Terlaksananya pembelajaran IPA')).toBeInTheDocument();
    });

    it('should have edit and delete buttons for each category', () => {
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        const editButtons = screen.getAllByTitle('Edit kategori');
        const deleteButtons = screen.getAllByTitle('Hapus kategori');

        expect(editButtons.length).toBe(3);
        expect(deleteButtons.length).toBe(3);
    });

    it('should handle empty categories list', () => {
        render(<AdminCategoriesClient initialCategories={[]} />);

        expect(screen.getByText('Kategori Laporan')).toBeInTheDocument();
        expect(screen.getByText('Nama Kategori')).toBeInTheDocument();

        // No rows in table body
        const rows = document.querySelectorAll('tbody tr');
        expect(rows.length).toBe(0);
    });

    it('should show edit form with correct is_teaching value', async () => {
        const user = userEvent.setup();
        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        // Edit a non-teaching category (id: 2)
        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[1]); // Second category

        await waitFor(() => {
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('false'); // Non-KBM should have "false" value
        });
    });

    it('should update category correctly via form submission', async () => {
        const user = userEvent.setup();

        render(<AdminCategoriesClient initialCategories={mockCategories} />);

        // Start editing first category
        const editButtons = screen.getAllByTitle('Edit kategori');
        await user.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Update Kategori')).toBeInTheDocument();
        });

        // Change the name
        const nameInput = screen.getByPlaceholderText('Contoh: Pembelajaran') as HTMLInputElement;
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Matematika');

        // Change the RHK label
        const rhkInput = screen.getByPlaceholderText('Contoh: Terlaksananya pembelajaran...') as HTMLInputElement;
        await user.clear(rhkInput);
        await user.type(rhkInput, 'Updated RHK');

        const submitButton = screen.getByText('Update Kategori');
        await user.click(submitButton);

        await waitFor(() => {
            expect(updateCategory).toHaveBeenCalledWith(1, expect.any(FormData));
        });
    });

});
