import React from "react";
import { ChevronLeft, Trash2, Calendar, Clock, BookOpen, Briefcase } from "lucide-react";
import Link from "next/link";
import { getSchedules, deleteSchedule, saveSchedule } from "./actions";
import { getCategories, getClassRooms, getImplementationBases } from "@/app/activities/actions";
import ScheduleForm from "@/components/ScheduleForm";

export default async function SchedulePage() {
    const schedules = await getSchedules();
    const categories = await getCategories();
    const classes = await getClassRooms();
    const bases = await getImplementationBases();

    const days = [
        "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Master Data</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Jadwal Rutin Mingguan</h1>
                <p className="text-slate-500 mt-1 font-medium">Atur jam mengajar (KBM) atau agenda rutin lainnya agar terisi otomatis di jurnal harian.</p>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 mt-10 grid lg:grid-cols-3 gap-8">
                {/* Form Section (Client Component) */}
                <ScheduleForm
                    categories={categories}
                    classes={classes}
                    bases={bases}
                    saveSchedule={saveSchedule}
                />

                {/* List Section */}
                <section className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 px-2">Daftar Jadwal Rutin</h2>
                    {schedules.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
                            <Calendar size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-wider">Belum ada jadwal yang diatur</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.map((item: any) => {
                                const classNames = item.schedule_class_rooms?.map((p: any) => p.class_rooms?.name).filter(Boolean).join(', ');

                                return (
                                    <div key={item.id} className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-amber-100 hover:shadow-xl hover:shadow-amber-50/50 transition-all flex items-start gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-amber-50 flex flex-col items-center justify-center text-amber-600 shrink-0 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{days[item.day_of_week].substring(0, 3)}</span>
                                            <span className="text-lg font-black leading-none mt-1"><Clock size={16} /></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors uppercase truncate">{item.topic}</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.report_categories?.name}</span>
                                            </div>

                                            {item.description && (
                                                <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mb-2 leading-relaxed">{item.description}</p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 w-fit">
                                                {item.teaching_hours && (
                                                    <div className="flex items-center gap-1.5 text-amber-600">
                                                        <Clock size={12} />
                                                        <span>{item.teaching_hours} JP</span>
                                                    </div>
                                                )}
                                                {classNames && (
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <BookOpen size={12} />
                                                        <span>Kls: {classNames}</span>
                                                    </div>
                                                )}
                                                {item.implementation_basis_id && (
                                                    <div className="flex items-center gap-1.5 text-blue-600">
                                                        <Briefcase size={12} />
                                                        <span>Dasar Tersimpan</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <form action={async () => { 'use server'; await deleteSchedule(item.id); }}>
                                            <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0">
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
