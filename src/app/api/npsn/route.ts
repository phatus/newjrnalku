import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const npsn = searchParams.get('npsn')?.trim()

    if (!npsn || npsn.length < 8) {
        return NextResponse.json({ error: 'NPSN harus 8 digit' }, { status: 400 })
    }

    try {
        // Try fetching from Kemdikbud reference data
        const res = await fetch(`https://referensi.data.kemdikbud.go.id/tabs.php?npsn=${npsn}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html',
            },
            signal: AbortSignal.timeout(8000),
        })

        if (!res.ok) {
            return NextResponse.json({ error: 'Gagal mengambil data dari Kemdikbud' }, { status: 502 })
        }

        const html = await res.text()

        // Parse school name from the HTML response
        // The page contains school data in a structured format
        const nameMatch = html.match(/<th[^>]*>\s*Nama\s*<\/th>\s*<td[^>]*>\s*([^<]+)/i)
            || html.match(/class="nama[^"]*"[^>]*>([^<]+)/i)
            || html.match(/<h3[^>]*>\s*([^<]+)/i)

        const addressMatch = html.match(/<th[^>]*>\s*Alamat\s*<\/th>\s*<td[^>]*>\s*([^<]+)/i)

        // Also try to get bentuk pendidikan (type)
        const typeMatch = html.match(/<th[^>]*>\s*Bentuk\s*Pendidikan\s*<\/th>\s*<td[^>]*>\s*([^<]+)/i)

        // Check if the page actually contains valid school data
        const hasSchoolData = html.includes('NPSN') && (nameMatch || html.includes(npsn))

        if (!hasSchoolData) {
            // Try alternative: dapo.kemdikbud.go.id
            try {
                const dapoRes = await fetch(`https://dapo.kemdikbud.go.id/sp/1/${npsn}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(5000),
                })
                if (dapoRes.ok) {
                    const dapoHtml = await dapoRes.text()
                    const dapoName = dapoHtml.match(/<title>([^<]+)/i)
                    if (dapoName && dapoName[1] && !dapoName[1].includes('404')) {
                        const schoolName = dapoName[1].replace(/\s*[-|].*$/, '').trim()
                        if (schoolName && schoolName.length > 3) {
                            return NextResponse.json({
                                found: true,
                                npsn,
                                name: schoolName,
                                address: null,
                                type: null,
                            })
                        }
                    }
                }
            } catch { /* fallthrough */ }

            return NextResponse.json({ found: false, npsn, error: 'Sekolah tidak ditemukan' })
        }

        const schoolName = nameMatch ? nameMatch[1].trim() : null
        const address = addressMatch ? addressMatch[1].trim() : null
        const schoolType = typeMatch ? typeMatch[1].trim() : null

        if (!schoolName) {
            return NextResponse.json({ found: false, npsn, error: 'Sekolah tidak ditemukan' })
        }

        return NextResponse.json({
            found: true,
            npsn,
            name: schoolName,
            address,
            type: schoolType,
        })

    } catch (error: any) {
        console.error('NPSN Lookup Error:', error)
        return NextResponse.json({ error: 'Gagal mencari data sekolah. Coba lagi nanti.' }, { status: 500 })
    }
}
