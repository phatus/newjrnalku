import React from "react";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { ReportHeader, ReportFooter, PrintButton, BackButton } from "@/components/ReportComponents";
import { redirect } from "next/navigation";

export default async function LabulReportPage(props: {
    searchParams: Promise<{ month?: string; year?: string }>;
}) {
    const searchParams = await props.searchParams;
    const month = parseInt(searchParams.month || new Date().getMonth().toString()) + 1;
    const year = parseInt(searchParams.year || new Date().getFullYear().toString());

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const adminSupa = createAdminClient();
    const { data: profile } = await adminSupa.from('profiles').select('*').eq('id', user.id).single();
    const { data: settings } = await adminSupa.from('school_settings').select('*').maybeSingle();

    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    const { data: activities, error } = await supabase
        .from('activities')
        .select(`
            *,
            category:report_categories(name, rhk_label)
        `)
        .eq('user_id', user.id)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_date', { ascending: true });

    if (error) console.error('Labul query error:', error);

    // Group activities by RHK category with aggregation for Uraian and Volume
    const groupedRHK: Record<string, {
        rhk: string;
        descriptions: string[];
        volume: number;
        evidences: string[]
    }> = {};

    (activities || []).forEach((act: any) => {
        const rhk = act.category?.rhk_label || "Lain-lain";
        if (!groupedRHK[rhk]) {
            groupedRHK[rhk] = { rhk, descriptions: [], volume: 0, evidences: [] };
        }
        groupedRHK[rhk].descriptions.push(act.description);
        groupedRHK[rhk].volume += 1;
        if (act.evidence_link) {
            groupedRHK[rhk].evidences.push(act.evidence_link);
        }
    });

    const monthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][month - 1];

    return (
        <div className="bg-white min-h-screen p-10 font-sans text-slate-900 max-w-7xl mx-auto printable-area">
            <div className="no-print mb-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pratinjau: LABUL — {monthName} {year}</p>
                <div className="flex gap-3">
                    <BackButton />
                    <PrintButton label="Cetak LABUL" />
                </div>
            </div>

            <h2 className="text-center text-xl font-black mb-1 tracking-wide">Laporan Kinerja Bulanan</h2>
            <p className="text-center text-sm font-bold text-slate-600 mb-8">{monthName} {year}</p>

            {/* Two Column Header Table */}
            <table className="w-full border-collapse border border-slate-900 text-[10px] mb-6">
                <thead>
                    <tr className="bg-amber-100">
                        <th className="border border-slate-900 px-4 py-2.5 w-1/2 text-center font-black">Pejabat Penilai</th>
                        <th className="border border-slate-900 px-4 py-2.5 w-1/2 text-center font-black">ASN yang Melaporkan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-slate-900 p-0">
                            <table className="w-full border-collapse text-[9px]">
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">NAMA</td>
                                    <td className="px-3 py-1.5">: {settings?.headmaster_name || '................................'}</td>
                                </tr>
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">NIP</td>
                                    <td className="px-3 py-1.5">: {settings?.headmaster_nip || '................................'}</td>
                                </tr>
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">PANGKAT/GOL</td>
                                    <td className="px-3 py-1.5">: {settings?.headmaster_pangkat || '................................'}</td>
                                </tr>
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">JABATAN</td>
                                    <td className="px-3 py-1.5">: {settings?.headmaster_jabatan || 'Kepala Madrasah'}</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">Unit Kerja</td>
                                    <td className="px-3 py-1.5">: {settings?.school_name || '................................'}</td>
                                </tr>
                            </table>
                        </td>
                        <td className="border border-slate-900 p-0">
                            <table className="w-full border-collapse text-[9px]">
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">NAMA</td>
                                    <td className="px-3 py-1.5">: {profile?.name || '................................'}</td>
                                </tr>
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">NIP</td>
                                    <td className="px-3 py-1.5">: {profile?.nip || '................................'}</td>
                                </tr>
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">PANGKAT/GOL</td>
                                    <td className="px-3 py-1.5">: {profile?.pangkat_gol || '................................'}</td>
                                </tr>
                                <tr className="border-b border-slate-900">
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">JABATAN</td>
                                    <td className="px-3 py-1.5">: {profile?.jabatan || '................................'}</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-1.5 w-28 font-bold border-r border-slate-900">Unit Kerja</td>
                                    <td className="px-3 py-1.5">: {settings?.school_name || '................................'}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Main Data Table */}
            <table className="w-full border-collapse border border-slate-900 text-[10px] mb-4">
                <thead>
                    <tr className="bg-amber-100">
                        <th className="border border-slate-900 px-2 py-3 font-bold uppercase w-10">NO</th>
                        <th className="border border-slate-900 px-3 py-3 font-bold uppercase text-center">RENCANA HASIL KERJA (RHK)</th>
                        <th className="border border-slate-900 px-3 py-3 font-bold uppercase text-center">URAIAN KEGIATAN</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold uppercase text-center w-20">VOLUME</th>
                        <th className="border border-slate-900 px-3 py-3 font-bold uppercase text-center">ALAMAT EVIDEN</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(groupedRHK).length > 0 ? Object.values(groupedRHK).map((item, i) => (
                        <tr key={item.rhk} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="border border-slate-900 px-2 py-3 text-center font-bold align-top">{i + 1}</td>
                            <td className="border border-slate-900 px-3 py-3 font-bold align-top">{item.rhk}</td>
                            <td className="border border-slate-900 px-3 py-3 align-top">
                                <ul className="list-disc pl-4 space-y-1 text-[9px]">
                                    {Array.from(new Set(item.descriptions)).map((desc, idx) => (
                                        <li key={idx}>{desc}</li>
                                    ))}
                                </ul>
                            </td>
                            <td className="border border-slate-900 px-2 py-3 text-center align-top font-bold whitespace-nowrap">{item.volume}</td>
                            <td className="border border-slate-900 px-3 py-3 align-top text-[8px] text-blue-600 break-all">
                                <div className="space-y-1">
                                    {Array.from(new Set(item.evidences)).map((link, idx) => (
                                        <p key={idx} className="underline">{link}</p>
                                    ))}
                                    {item.evidences.length === 0 && <p className="text-slate-400">-</p>}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="border border-slate-900 px-2 py-12 text-center italic text-slate-500">
                                Belum ada data kinerja untuk periode ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <p className="text-center text-[9px] text-slate-500 mb-16">* Halaman berlanjut jika ada</p>

            <ReportFooter
                profileName={profile?.name}
                profileNip={profile?.nip}
                headmasterName={settings?.headmaster_name}
                headmasterNip={settings?.headmaster_nip}
                schoolName={settings?.school_name}
                schoolAddress={settings?.school_address}
            />
        </div>
    );
}
