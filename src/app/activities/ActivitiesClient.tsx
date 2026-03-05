"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    ChevronLeft,
    Search,
    Filter,
    Trash2,
    FileText,
    BookOpen,
    Calendar,
    Clock,
    MapPin,
    ExternalLink,
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { deleteActivity } from "@/app/activities/actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ActivitiesClientProps {
    initialActivities: Activity[];
    currentMonth?: number;
    currentYear?: number;
    message?: string;
    type?: string;
}

interface Activity {
    id: string;
    description: string;
    activity_date: string;
    category?: {
        name?: string;
        is_teaching?: boolean;
    } | null;
    teaching_hours?: number | string | null;
    classes?: Array<{ class?: { id?: number; name?: string } }> | null;
    basis?: { name?: string } | null;
    evidence_link?: string | null;
}

export default function ActivitiesClient({
    initialActivities,
    currentMonth,
    currentYear,
    message,
    type
}: ActivitiesClientProps) {
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [search, setSearch] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] = useState(currentMonth || new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentYear || new Date().getFullYear());

    // Sync activities state when initialActivities changes
    useEffect(() => {
        setActivities(initialActivities);
    }, [initialActivities]);

    const filteredActivities = activities.filter((act: Activity) =>
        act.description.toLowerCase().includes(search.toLowerCase()) ||
        (act.category?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    function handleFilter() {
        router.push(`/activities?month=${selectedMonth}&year=${selectedYear}`);
    }

    function handleDeleteClick(id: string) {
        setItemToDelete(id);
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        if (!itemToDelete) return;
        setShowDeleteModal(false);
        setLoadingId(itemToDelete);
        try {
            await deleteActivity(itemToDelete);
            setActivities(activities.filter(a => a.id !== itemToDelete));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingId(null);
            setItemToDelete(null);
        }
    }

    // Group activities by date
    const groupedActivities = useMemo(() => {
        return filteredActivities.reduce((acc: Record<string, Activity[]>, act: Activity) => {
            const date = act.activity_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(act);
            return acc;
        }, {} as Record<string, Activity[]>);
    }, [filteredActivities]);

    const sortedDates = useMemo(() => Object.keys(groupedActivities).sort().reverse(), [groupedActivities]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Riwayat Kegiatan</span>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Kegiatan Harian</h1>
                        <p className="text-slate-500 mt-1 font-medium">Lihat dan kelola seluruh catatan aktivitas Anda.</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Month/Year Filter */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="h-10 px-4 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="h-10 px-4 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer border-l border-slate-200"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleFilter}
                                className="h-10 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                Filter
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Cari kegiatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-12 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 w-full md:w-64 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 mt-10">
                {message && (
                    <div className={cn(
                        "mb-8 p-6 rounded-[2rem] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                        type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                    )}>
                        {type === 'error' ? <AlertCircle className="shrink-0" /> : <CheckCircle2 className="shrink-0" />}
                        <p className="text-sm font-black uppercase tracking-tight">{message}</p>
                    </div>
                )}

                {filteredActivities.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Tidak Ada Kegiatan</h3>
                        <p className="text-slate-400 font-medium mt-2">Coba kata kunci lain atau pilih bulan lain.</p>
                        <Link href="/activities/create" className="inline-flex h-12 items-center px-8 rounded-xl bg-amber-500 text-white font-bold text-sm uppercase tracking-widest mt-8 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-100">
                            Catat Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedDates.map((date) => {
                            const dateObj = new Date(date + 'T00:00:00');
                            const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                            const dayStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                            const dayNum = dateObj.getDate();

                            return (
                                <div key={date} className="space-y-4">
                                    {/* Date Header */}
                                    <div className="sticky top-0 bg-slate-50 py-3 px-4 rounded-2xl border border-slate-100 flex items-center justify-between z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center bg-white rounded-xl p-2 min-w-16 border border-slate-100">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dayStr.slice(0, 3)}</span>
                                                <span className="text-2xl font-black text-slate-900">{dayNum}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{dateStr}</p>
                                                <p className="text-xs font-bold text-slate-400 mt-0.5">{groupedActivities[date].length} aktivitas</p>
                                            </div>
                                        </div>
                                        <div className="hidden lg:block text-xs font-bold text-slate-400">
                                            {groupedActivities[date].filter((a: Activity) => a.category?.is_teaching).length} KBM
                                        </div>
                                    </div>

                                    {/* Activities for this date */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-0 lg:pl-20">
                                        {groupedActivities[date].map((act: Activity) => (
                                            <div
                                                key={act.id}
                                                className={cn(
                                                    "rounded-2xl p-4 border transition-all hover:shadow-lg hover:-translate-y-0.5 group cursor-pointer",
                                                    act.category?.is_teaching
                                                        ? "bg-amber-50 border-amber-100 hover:border-amber-200"
                                                        : "bg-blue-50 border-blue-100 hover:border-blue-200"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                        act.category?.is_teaching ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {act.category?.is_teaching ? <BookOpen size={20} /> : <FileText size={20} />}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="flex-1 min-w-0">
                                                                <span className={cn(
                                                                    "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-1",
                                                                    act.category?.is_teaching ? "bg-amber-200 text-amber-700" : "bg-blue-200 text-blue-700"
                                                                )}>
                                                                    {act.category?.name}
                                                                </span>
                                                                <h4 className="text-sm font-black text-slate-900 tracking-tight line-clamp-2">{act.description}</h4>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Link
                                                                    href={`/activities/${act.id}/edit`}
                                                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/50 text-slate-400 hover:text-amber-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <FileText size={16} />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDeleteClick(act.id)}
                                                                    disabled={loadingId === act.id}
                                                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-100/50 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                                >
                                                                    {loadingId === act.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Meta info */}
                                                        <div className="space-y-2 text-xs">
                                                            {act.category?.is_teaching && (
                                                                <>
                                                                    {act.teaching_hours && (
                                                                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                                                                            <Clock size={12} className="text-amber-600" />
                                                                            {act.teaching_hours} JP
                                                                        </div>
                                                                    )}
                                                                    {act.classes && act.classes.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {act.classes.map((c, idx) => (
                                                                                <span key={idx} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-bold border border-amber-200">
                                                                                    {c.class?.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {act.basis?.name && (
                                                                <p className="text-slate-600 font-medium truncate">📋 {act.basis?.name}</p>
                                                            )}

                                                            {act.evidence_link && (
                                                                <a
                                                                    href={act.evidence_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                                                >
                                                                    🔗 Bukti <ExternalLink size={10} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center tracking-tight">Hapus Kegiatan?</h3>
                        <p className="text-slate-500 mt-2 font-medium text-sm text-center leading-relaxed">
                            Tindakan ini tidak dapat dibatalkan. Data kegiatan ini akan dihapus secara permanen dari sistem.
                        </p>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
