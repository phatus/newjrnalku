import React from "react";
import {
    FileText,
    TrendingUp,
    History,
    Search,
    BookOpen,
    ClipboardCheck
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getDashboardStats } from "@/app/activities/actions";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const stats = await getDashboardStats();

    const reportTypes = [
        { id: "catkin", name: "Catatan Kinerja", desc: "Daftar lengkap seluruh kegiatan harian Anda.", icon: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
        { id: "jurnal", name: "Jurnal Mengajar", desc: "Laporan khusus kegiatan belajar mengajar di kelas.", icon: "BookOpen", color: "text-amber-500", bg: "bg-amber-50" },
        { id: "labul", name: "Laporan Bulanan", desc: "Evaluasi capaian RHK yang dikelompokkan per kategori.", icon: "ClipboardCheck", color: "text-green-500", bg: "bg-green-50" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-7xl mx-auto">
                    <div className="space-y-1">
                        <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Kinerja & Dokumentasi</span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pusat Laporan Guru</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-10 grid lg:grid-cols-4 gap-8">
                {/* Left: Summary Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-amber-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-amber-100 relative overflow-hidden group">
                        <div className="relative z-10 space-y-8">
                            <div>
                                <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Status Kinerja</p>
                                <h3 className="text-2xl font-black mt-1">Normal</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-4xl font-black">{stats?.totalActivities > 0 ? 'Aktif' : 'Belum Aktif'}</p>
                                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Status Pencatatan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">Analisis Cepat</h4>
                        </div>

    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide">Mulai catat kegiatan Anda hari ini untuk melihat analisis kinerja di sini.</p>
                    </div>
                </div>

                {/* Right: Report Selection via Client Component */}
                <div className="lg:col-span-3 space-y-10">
                    <ReportsClient reportTypes={reportTypes} />

                    {/* Export History Table Placeholder */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <History size={20} className="text-slate-400" />
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Riwayat Unduhan</h2>
                            </div>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input type="text" placeholder="Cari laporan..." className="h-10 pl-10 pr-4 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500/20 w-48 transition-all" />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-20 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada riwayat unduhan</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
