"use client";

import React, { useState } from "react";
import { Calendar, Filter, Download, ArrowRight, FileText, BookOpen, ClipboardCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
    FileText,
    BookOpen,
    ClipboardCheck
};

export default function ReportsClient({ reportTypes }: { reportTypes: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [month, setMonth] = useState(searchParams.get("month") || new Date().getMonth().toString());
    const [year, setYear] = useState(searchParams.get("year") || new Date().getFullYear().toString());

    function handleDownload(id: string) {
        router.push(`/reports/${id}?month=${month}&year=${year}`);
    }

    return (
        <div className="space-y-10">
            {/* Filters Header (Duplicate of what was in page.tsx but functional) */}
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-fit ml-auto -mt-20 relative z-20">
                <div className="flex items-center gap-2 px-3 border-r border-slate-200">
                    <Calendar size={18} className="text-slate-400" />
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-transparent border-none text-xs font-black text-slate-700 focus:ring-0 appearance-none py-1"
                    >
                        {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                </div>
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-transparent border-none text-xs font-black text-slate-700 focus:ring-0 appearance-none py-1 pr-8"
                >
                    {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <section className="space-y-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight ml-2 border-l-4 border-amber-500 pl-4">Eksport Laporan</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {reportTypes.map((type) => {
                        const Icon = iconMap[type.icon] || FileText;
                        return (
                            <div key={type.id} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className={cn("h-20 w-20 rounded-[1.5rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110", type.bg, type.color)}>
                                    <Icon size={36} />
                                </div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">{type.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed h-8 line-clamp-2">{type.desc}</p>

                                <div className="mt-8 flex items-center gap-2 w-full pt-6 border-t border-slate-50">
                                    <button
                                        onClick={() => handleDownload(type.id)}
                                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 transition-colors"
                                    >
                                        <Download size={14} />
                                        PDF / CETAK
                                    </button>
                                    <button
                                        onClick={() => handleDownload(type.id)}
                                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-amber-500 transition-colors"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
