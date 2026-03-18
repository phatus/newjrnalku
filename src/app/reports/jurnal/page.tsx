import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { ReportHeader, ReportFooter, PrintButton, BackButton } from "@/components/ReportComponents";
import { redirect } from "next/navigation";
import type { Activity } from "@/types";

export default async function JurnalReportPage(props: {
    searchParams: Promise<{ month?: string; year?: string }>;
}) {
    const searchParams = await props.searchParams;
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const month = searchParams.month ? parseInt(searchParams.month) : currentMonth;
    const year = parseInt(searchParams.year || new Date().getFullYear().toString());

    // Use regular client for auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const adminSupa = createAdminClient();

    const { data: profile } = await adminSupa.from('profiles').select('*, school:schools(*)').eq('id', user.id).maybeSingle();

    // month is already 1-12, so we use month+1 to get last day of current month
    const lastDate = new Date(year, month + 1, 0); // Date object for last day of month
    const lastDay = lastDate.getDate();
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    // Filter for teaching activities only using !inner join
    const { data: activities, error } = await adminSupa
        .from('activities')
        .select(`
            *,
            category:report_categories!inner(name, is_teaching),
            classes:activity_class_rooms(
                class:class_rooms(name)
            )
        `)
        .eq('user_id', user.id)
        .eq('report_categories.is_teaching', true)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_date', { ascending: true });

    if (error) console.error('Jurnal query error:', error);

    const monthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][month - 1];

    return (
        <div className="bg-white min-h-screen p-10 print:p-0 font-sans text-slate-900 max-w-5xl mx-auto printable-area">
            <div className="no-print mb-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pratinjau: JURNAL MENGAJAR — {monthName} {year}</p>
                <div className="flex gap-3">
                    <BackButton />
                    <PrintButton label="Cetak Jurnal" />
                </div>
            </div>


            <h2 className="text-center text-lg font-black mb-1 tracking-wide">Jurnal Pelaksanaan Pembelajaran</h2>
            <p className="text-center text-xs font-bold text-slate-600 mb-6">{monthName} {year}</p>

            {/* Teacher Information Section */}
            <div className="mb-6 text-sm">
                <table className="w-full text-[11px] leading-relaxed">
                    <tbody>
                        <tr>
                            <td className="font-bold w-32">Nama Guru</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.name || '................................'}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">NIP</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.nip || '................................'}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">Mata Pelajaran</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.subject || 'Semua Mapel'}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">Unit Kerja</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.school?.name || '................................'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Main Data Table */}
            <table className="w-full border-collapse border border-slate-900 text-[10px] mb-4">
                <thead>
                    <tr className="bg-amber-100/50">
                        <th className="border border-slate-900 px-2 py-3 font-bold w-8">No</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-28">Hari / Tgl</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-24">Kelas</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-16">Jam Ke</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold">Materi Pembelajaran</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-32">Hasil / Capaian</th>
                    </tr>
                </thead>
                <tbody>
                    {(() => {
                        const dateSpans: Record<string, number> = {};
                        (activities || []).forEach((act: Activity) => {
                            const d = act.activity_date;
                            dateSpans[d] = (dateSpans[d] || 0) + 1;
                        });

                        let lastDate = "";
                        let globalNo = 0;

                        return (activities || []).map((act: Activity, i: number) => {
                            const isNewDate = act.activity_date !== lastDate;
                            if (isNewDate) {
                                lastDate = act.activity_date;
                                globalNo++;
                            }

                            const dateObj = new Date(act.activity_date);
                            const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
                            const day = dateObj.getDate().toString().padStart(2, '0');
                            const monthIndex = dateObj.getMonth();
                            const yearNum = dateObj.getFullYear();
                            const fullMonthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][monthIndex];

                            const dateStr = `${day}/${String(monthIndex + 1).padStart(2, '0')}/${yearNum}`;
                            const classNames = act.classes?.map((c) => c.class?.name).join(', ');

                            return (
                                <tr key={act.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    {isNewDate && (
                                        <>
                                            <td rowSpan={dateSpans[act.activity_date]} className="border border-slate-900 px-2 py-2 text-center align-top font-bold">
                                                {globalNo}
                                            </td>
                                            <td rowSpan={dateSpans[act.activity_date]} className="border border-slate-900 px-2 py-2 text-center align-top font-bold text-[9px] whitespace-nowrap">
                                                {dayName}, {dateStr}
                                            </td>
                                        </>
                                    )}
                                    <td className="border border-slate-900 px-2 py-2 text-center font-bold">{classNames || '-'}</td>
                                    <td className="border border-slate-900 px-2 py-2 text-center font-bold">{act.teaching_hours || '-'}</td>
                                    <td className="border border-slate-900 px-2 py-2">{act.learning_material || act.topic || act.description}</td>
                                    <td className="border border-slate-900 px-2 py-2 text-[9px]">{act.learning_outcome || act.student_outcome || '-'}</td>
                                </tr>
                            );
                        });
                    })()}
                    {(!activities || activities.length === 0) && (
                        <tr>
                            <td colSpan={6} className="border border-slate-900 px-2 py-8 text-center text-slate-500 italic">Tidak ada data jurnal mengajar pada periode ini</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <p className="text-center text-[9px] text-slate-500 mb-8 print:mb-4">* Halaman berlanjut jika ada</p>

            <ReportFooter
                profileName={profile?.name}
                profileNip={profile?.nip}
                headmasterName={profile?.school?.headmaster_name}
                headmasterNip={profile?.school?.headmaster_nip}
                schoolName={profile?.school?.name}
                schoolAddress={profile?.school?.address}
                schoolCity={profile?.school?.city}
                reportDate={lastDate}
            />
        </div>
    );
}
