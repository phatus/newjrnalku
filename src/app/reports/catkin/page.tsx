import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { ReportHeader, ReportFooter, PrintButton, BackButton } from "@/components/ReportComponents";
import { redirect } from "next/navigation";

export default async function CatkinReportPage(props: {
    searchParams: Promise<{ month?: string; year?: string }>;
}) {
    const searchParams = await props.searchParams;
    const month = parseInt(searchParams.month || (new Date().getMonth() + 0).toString()) + 1;
    const year = parseInt(searchParams.year || new Date().getFullYear().toString());

    // Use regular client for auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Use admin client for the report data to bypass RLS on pivot tables
    const adminSupa = createAdminClient();

    const { data: profile } = await adminSupa.from('profiles').select('*, school:schools(*)').eq('id', user.id).maybeSingle();

    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    const { data: activities, error } = await adminSupa
        .from('activities')
        .select(`
            *,
            category:report_categories(name, is_teaching),
            basis:implementation_bases(name),
            classes:activity_class_rooms(
                class:class_rooms(name)
            )
        `)
        .eq('user_id', user.id)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_date', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) console.error('Catkin query error:', error);

    // Group activities by date
    const groupedActivities: Record<string, any[]> = {};
    (activities || []).forEach(act => {
        if (!groupedActivities[act.activity_date]) {
            groupedActivities[act.activity_date] = [];
        }
        groupedActivities[act.activity_date].push(act);
    });

    const sortedDates = Object.keys(groupedActivities).sort();

    const monthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][month - 1];

    return (
        <div className="bg-white min-h-screen p-10 font-sans text-slate-900 max-w-5xl mx-auto printable-area">
            <div className="no-print mb-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pratinjau: CATKIN — {monthName} {year}</p>
                <div className="flex gap-3">
                    <BackButton />
                    <PrintButton label="Cetak CATKIN" />
                </div>
            </div>


            <h2 className="text-center text-lg font-black mb-1 tracking-wide">Laporan Catatan Kinerja Harian</h2>
            <p className="text-center text-xs font-bold text-slate-600 mb-6">(CATKIN) — {monthName} {year}</p>

            {/* Employee Information Section */}
            <div className="mb-6 text-sm">
                <table className="w-full text-[11px] leading-relaxed">
                    <tbody>
                        <tr>
                            <td className="font-bold w-32">Nama Pegawai</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.name || '................................'}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">NIP</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.nip || '................................'}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">Pangkat / Gol.</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.pangkat_gol || '................................'}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">Jabatan</td>
                            <td className="px-2">:</td>
                            <td className="font-medium">{profile?.jabatan || '................................'}</td>
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
                    <tr className="bg-amber-100">
                        <th className="border border-slate-900 px-2 py-3 font-bold w-8">No</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-32">Hari / Tanggal</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold">Dasar Pelaksanaan</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold">Uraian Pekerjaan</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-32">Hasil / Output</th>
                        <th className="border border-slate-900 px-2 py-3 font-bold w-20">Paraf</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedDates.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="border border-slate-900 px-2 py-8 text-center text-slate-500 italic">Tidak ada data kegiatan pada periode ini</td>
                        </tr>
                    ) : (
                        sortedDates.map((date, dateIndex) => {
                            const dateActivities = groupedActivities[date];
                            const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });
                            const dateStr = new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

                            return dateActivities.map((act, actIndex) => {
                                const classNames = act.classes?.map((c: any) => c.class?.name).join(', ');
                                return (
                                    <tr key={act.id} className={actIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        {actIndex === 0 && (
                                            <>
                                                <td rowSpan={dateActivities.length} className="border border-slate-900 px-2 py-2 text-center font-bold align-top">
                                                    {dateIndex + 1}
                                                </td>
                                                <td rowSpan={dateActivities.length} className="border border-slate-900 px-2 py-2 text-center font-bold align-top whitespace-nowrap text-[9px]">
                                                    {dayName}, {dateStr}
                                                </td>
                                            </>
                                        )}
                                        <td className="border border-slate-900 px-2 py-2">{act.basis?.name || '-'}</td>
                                        <td className="border border-slate-900 px-2 py-2">
                                            <div className="font-medium">{act.category?.is_teaching ? (act.learning_material || act.description) : act.description}</div>
                                            {act.category?.is_teaching && classNames && (
                                                <div className="text-[9px] text-slate-600 italic mt-0.5">Kls: {classNames}</div>
                                            )}
                                        </td>
                                        <td className="border border-slate-900 px-2 py-2 text-[9px]">{act.learning_outcome || act.student_outcome || 'Terlaksana'}</td>
                                        {actIndex === 0 && (
                                            <td rowSpan={dateActivities.length} className="border border-slate-900 px-2 py-2 text-center align-top"></td>
                                        )}
                                    </tr>
                                );
                            });
                        })
                    )}
                </tbody>
            </table>

            <p className="text-center text-[9px] text-slate-500 mb-16">* Halaman berlanjut jika ada</p>

            <ReportFooter
                profileName={profile?.name}
                profileNip={profile?.nip}
                headmasterName={profile?.school?.headmaster_name}
                headmasterNip={profile?.school?.headmaster_nip}
                schoolName={profile?.school?.name}
                schoolAddress={profile?.school?.address}
                schoolCity={profile?.school?.city}
            />
        </div>
    );
}
