import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/npsn/route';

// Mock global fetch
global.fetch = vi.fn();

function createMockRequest(npsn: string): Request {
    return new Request(`http://localhost/api/npsn?npsn=${npsn}`);
}

describe('GET /api/npsn', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if NPSN is missing', async () => {
        const request = createMockRequest('');
        const response = await GET(request);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('NPSN harus 8 digit');
    });

    it('should return 400 if NPSN is less than 8 digits', async () => {
        const request = createMockRequest('1234567');
        const response = await GET(request);
        expect(response.status).toBe(400);
    });

    it('should return school data from Source 1 (Kemendikdasmen) when found', async () => {
        const mockHtml = `
<html><body>
<h3>SMAN 1 Jakarta</h3>
<table>
<tr><td>Nama</td><td>: SMAN 1 JAKARTA</td></tr>
<tr><td>Alamat</td><td>: Jl. Sudirman</td></tr>
<tr><td>Bentuk Pendidikan</td><td>: SMA</td></tr>
<tr><td>Kab.-Kota</td><td>: Jakarta Pusat</td></tr>
<tr><td>Kecamatan</td><td>: Gambir</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data.found).toBe(true);
        expect(data.npsn).toBe('12345678');
        expect(data.name).toBe('SMAN 1 Jakarta');
        expect(data.address).toBe('Jl. Sudirman');
        expect(data.type).toBe('SMA');
        expect(data.city).toBe('Jakarta Pusat');
        expect(data.kecamatan).toBe('Gambir');
    });

    it('should extract city from Kabupaten field', async () => {
        const mockHtml = `
<html><body>
<h3>SDN 2 Bandung</h3>
<table>
<tr><td>Nama</td><td>: SD NEGERI 2 BANDUNG</td></tr>
<tr><td>Alamat</td><td>: Jl. Asia Afrika</td></tr>
<tr><td>Kabupaten</td><td>: Bandung</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('SD Negeri 2 Bandung');
        expect(data.address).toBe('Jl. Asia Afrika');
        expect(data.city).toBe('Bandung');
        expect(data.type).toBeNull();
        expect(data.kecamatan).toBe('');
    });

    it('should clean Kab. prefix from city value', async () => {
        const mockHtml = `
<html><body>
<h3>MTsN 1 Banyuwangi</h3>
<table>
<tr><td>Nama</td><td>: MTsN 1 BANYUWANGI</td></tr>
<tr><td>Kabupaten</td><td>: KAB. Banyuwangi</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('MTsN 1 Banyuwangi');
        expect(data.city).toBe('Banyuwangi');
    });

    it('should fallback to Source 2 when Source 1 fails', async () => {
        // Source 1 fails (not ok)
        (global.fetch as any).mockResolvedValueOnce({ ok: false });
        // Source 2 returns data (without colon in value cell)
        const mockHtml2 = `
<html><body>
<tr><td>Nama</td><td>SMA NEGERI 1 SURABAYA</td></tr>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml2 });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.found).toBe(true);
        expect(data.name).toBe('SMA Negeri 1 Surabaya');
        expect(data.address).toBeNull();
        expect(data.city).toBeNull();
    });

    it('should fallback to Source 3 when Sources 1 and 2 fail', async () => {
        (global.fetch as any)
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({
                ok: true,
                text: async () => '<html><head><title>SD NEGERI 3 MALANG - Dapodik</title></head></html>',
            });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.found).toBe(true);
        expect(data.name).toBe('SD Negeri 3 Malang');
        expect(data.address).toBeNull();
        expect(data.city).toBeNull();
    });

    it('should return not found when all sources fail', async () => {
        (global.fetch as any)
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: false });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.found).toBe(false);
        expect(data.error).toBe('Sekolah tidak ditemukan secara otomatis.');
        expect(data.manual_url).toContain('referensi.data.kemendikdasmen.go.id');
    });

    it('should fallback when Source 1 returns no valid name', async () => {
        // Source 1 with empty name
        const mockHtml1 = `
<html><body>
<table>
<tr><td>Nama</td><td>: </td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml1 });
        // Source 2 with valid name (no colon)
        const mockHtml2 = `
<html><body>
<tr><td>Nama</td><td>SMKN 1 Bekasi</td></tr>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml2 });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('SMKN 1 Bekasi');
    });

    it('should clean KOTA prefix from city field but not from name', async () => {
        const mockHtml = `
<html><body>
<h3>SDN 1 KOTA SURABAYA</h3>
<table>
<tr><td>Nama</td><td>: SD NEGERI 1 KOTA SURABAYA</td></tr>
<tr><td>Kabupaten</td><td>: KOTA SURABAYA</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('SD Negeri 1 Kota Surabaya');
        expect(data.city).toBe('Surabaya');
    });

    it('should handle acronyms: MI, SMA, SMP, SDN, etc.', async () => {
        const mockHtml = `
<html><body>
<h3>MI Nurul Huda</h3>
<table>
<tr><td>Nama</td><td>: MI NURUL HUDA</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('MI Nurul Huda');
    });

    it('should handle DKI Jakarta acronym', async () => {
        const mockHtml = `
<html><body>
<h3>SMA 1 DKI JAKARTA</h3>
<table>
<tr><td>Nama</td><td>: SMA 1 DKI JAKARTA</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('SMA 1 DKI Jakarta');
    });

    it('should lowercase then capitalize for regular words', async () => {
        const mockHtml = `
<html><body>
<h3>smp negeri 2</h3>
<table>
<tr><td>Nama</td><td>: smp negeri 2</td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('SMP Negeri 2');
    });

    it('should trim whitespace from extracted values', async () => {
        const mockHtml = `
<html><body>
<h3>  SDN 3  </h3>
<table>
<tr><td>Nama</td><td>:  SDN 3  </td></tr>
</table>
</body></html>
        `;
        (global.fetch as any).mockResolvedValueOnce({ ok: true, text: async () => mockHtml });

        const request = createMockRequest('12345678');
        const response = await GET(request);
        const data = await response.json();

        expect(data.name).toBe('SDN 3');
    });
});
