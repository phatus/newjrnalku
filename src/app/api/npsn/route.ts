import { NextResponse } from 'next/server'

// Helper to convert ALL CAPS to Title Case, with exceptions for acronyms
function toTitleCase(str: string) {
    if (!str) return str;

    // Initial basic Title Case
    let result = str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, (match) => match.toUpperCase());

    // Map of common Indonesian school acronyms for post-processing
    const acronyms: Record<string, string> = {
        'Mtsn': 'MTsN',
        'Man': 'MAN',
        'Min': 'MIN',
        'Mts': 'MTs',
        'Smkn': 'SMKN',
        'Sman': 'SMAN',
        'Smpn': 'SMPN',
        'Sdn': 'SDN',
        'Smk': 'SMK',
        'Sma': 'SMA',
        'Smp': 'SMP',
        'Sd': 'SD',
        'Tk': 'TK',
        'Paud': 'PAUD',
        'Pkbm': 'PKBM',
        'Skb': 'SKB',
        'Mi': 'MI',
        'Ma': 'MA',
        'Dki': 'DKI',
        'Upt': 'UPT',
        'Dprd': 'DPRD',
    };

    // Apply specific casing for acronyms (regex with word boundary \b)
    Object.keys(acronyms).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        result = result.replace(regex, acronyms[key]);
    });

    return result;
}

// Clean prefixes like "KAB. ", "PROV. ", etc.
function cleanPrefix(str: string) {
    if (!str) return str;
    // Remove KAB. or KABUPATEN or KOTA at the start, case insensitive
    // Updated to be more thorough
    return str.replace(/^(KAB\.|KABUPATEN|KOTA|PROV\.|PROVINSI|KEC\.|KECAMATAN)\s+/i, '').trim();
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const npsn = searchParams.get('npsn')?.trim()

    if (!npsn || npsn.length < 8) {
        return NextResponse.json({ error: 'NPSN harus 8 digit' }, { status: 400 })
    }

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s total timeout

        let schoolData: any = null

        // --- Source 1: New Kemendikdasmen Domain (Primary) ---
        try {
            const res = await fetch(`https://referensi.data.kemendikdasmen.go.id/tabs.php?npsn=${npsn}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                signal: AbortSignal.timeout(12000),
            })

            if (res.ok) {
                const html = await res.text()

                // Helper to find value by label in the table - more robust matching for [^<]*</td>
                const findValue = (labelPattern: string) => {
                    const regex = new RegExp(`>\\s*${labelPattern}[^<]*<\\/t[dh]>\\s*(?:<td[^>]*>\\s*[:\\-]\\s*<\\/td>\\s*)?<t[dh][^>]*>\\s*([^<]+)`, 'i')
                    const match = html.match(regex)
                    if (match && match[1]) return match[1].trim().replace(/^[:\-\s]+/, '')
                    return null
                }

                const schoolName = findValue('Nama') || html.match(/<h[234][^>]*>\s*([^<]+)/i)?.[1]?.trim()
                const address = findValue('Alamat')
                const type = findValue('Bentuk\\s*Pendidikan')

                // Specifically target Kabupaten by skipping the label that starts with Kecamatan
                const kab = findValue('Kab\\.-Kota') || findValue('Kabupaten')
                const kec = findValue('Kecamatan')

                if (schoolName && schoolName.length > 3) {
                    schoolData = {
                        name: toTitleCase(schoolName),
                        address: toTitleCase(address || ''),
                        type: type || null,
                        city: toTitleCase(cleanPrefix(kab || '')),
                        kecamatan: toTitleCase(cleanPrefix(kec || '')),
                    }
                }
            }
        } catch (e) {
            console.warn('Source 1 failed:', e)
        }

        // --- Source 2: Old Kemdikbud Domain ---
        if (!schoolData) {
            try {
                const res = await fetch(`https://referensi.data.kemdikbud.go.id/tabs.php?npsn=${npsn}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(8000),
                })
                if (res.ok) {
                    const html = await res.text()
                    const nameMatch = html.match(/Nama[^<]*<\/t[dh]>\s*(?:<td[^>]*>\s*[:\-]\s*<\/td>\s*)?<t[dh][^>]*>\s*([^<]+)/i)
                    if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 3) {
                        schoolData = {
                            name: toTitleCase(nameMatch[1].trim()),
                            address: null,
                            type: null,
                            city: null,
                        }
                    }
                }
            } catch (e) {
                console.warn('Source 2 failed')
            }
        }

        // --- Source 3: Dapodik ---
        if (!schoolData) {
            try {
                const dapoRes = await fetch(`https://dapo.kemdikbud.go.id/sp/1/${npsn}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(5000),
                })
                if (dapoRes.ok) {
                    const dapoHtml = await dapoRes.text()
                    const dapoName = dapoHtml.match(/<title>([^<]+)/i)
                    if (dapoName && dapoName[1] && !dapoName[1].includes('404')) {
                        const cleanName = dapoName[1].split('-')[0].trim()
                        if (cleanName && cleanName.length > 5) {
                            schoolData = {
                                name: toTitleCase(cleanName),
                                address: null,
                                type: null,
                                city: null,
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Source 3 failed')
            }
        }

        clearTimeout(timeoutId)

        if (!schoolData || !schoolData.name) {
            return NextResponse.json({
                found: false,
                npsn,
                error: 'Sekolah tidak ditemukan secara otomatis.',
                manual_url: `https://referensi.data.kemendikdasmen.go.id/tabs.php?npsn=${npsn}`
            })
        }

        return NextResponse.json({
            found: true,
            npsn,
            ...schoolData
        })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 })
    }
}
