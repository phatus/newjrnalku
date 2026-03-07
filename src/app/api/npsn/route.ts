import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const npsn = searchParams.get('npsn')?.trim()

    if (!npsn || npsn.length < 8) {
        return NextResponse.json({ error: 'NPSN harus 8 digit' }, { status: 400 })
    }

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s total timeout

        // --- Source 1: Referensi Kemdikbud (Heuristic & Detailed) ---
        let schoolData: any = null

        try {
            const res = await fetch(`https://referensi.data.kemdikbud.go.id/tabs.php?npsn=${npsn}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html',
                },
                signal: AbortSignal.timeout(10000), // 10s for this specific source
            })

            if (res.ok) {
                const html = await res.text()
                const nameMatch = html.match(/<th[^>]*>\s*Nama\s*<\/th>\s*<td[^>]*>\s*([^<]+)/i)
                    || html.match(/class="nama[^"]*"[^>]*>([^<]+)/i)
                const addressMatch = html.match(/<th[^>]*>\s*Alamat\s*<\/th>\s*<td[^>]*>\s*([^<]+)/i)
                const typeMatch = html.match(/<th[^>]*>\s*Bentuk\s*Pendidikan\s*<\/th>\s*<td[^>]*>\s*([^<]+)/i)

                if (nameMatch && nameMatch[1]) {
                    schoolData = {
                        name: nameMatch[1].trim(),
                        address: addressMatch ? addressMatch[1].trim() : null,
                        type: typeMatch ? typeMatch[1].trim() : null,
                    }
                }
            }
        } catch (e) {
            console.warn('Source 1 (Referensi) failed/timeout, trying Source 2...')
        }

        // --- Source 2: Dapodik / sp.kemdikbud.go.id (Faster but less detail) ---
        if (!schoolData) {
            try {
                const dapoRes = await fetch(`https://dapo.kemdikbud.go.id/sp/1/${npsn}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(5000),
                })
                if (dapoRes.ok) {
                    const dapoHtml = await dapoRes.text()
                    // Extract name from title like "<title>SMK NEGERI 1 PACITAN - Data Sekolah</title>"
                    const dapoName = dapoHtml.match(/<title>([^<]+)/i)
                    if (dapoName && dapoName[1] && !dapoName[1].includes('404')) {
                        const cleanName = dapoName[1].split('-')[0].trim()
                        if (cleanName && cleanName.length > 5) {
                            schoolData = {
                                name: cleanName,
                                address: null,
                                type: null,
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Source 2 (Dapo) failed/timeout')
            }
        }

        clearTimeout(timeoutId)

        if (!schoolData || !schoolData.name) {
            return NextResponse.json({
                found: false,
                npsn,
                error: 'Sekolah tidak ditemukan atau server Kemdikbud sedang sibuk. Silakan isi nama secara manual.'
            })
        }

        return NextResponse.json({
            found: true,
            npsn,
            ...schoolData
        })

    } catch (error: any) {
        console.error('NPSN Lookup Route Exception:', {
            npsn,
            message: error.message,
            stack: error.stack,
            cause: error.cause
        })
        return NextResponse.json({
            error: `Gagal mencari data sekolah: ${error.message || 'Server error'}`
        }, { status: 500 })
    }
}
