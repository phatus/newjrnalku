"use client";

import React, { useState } from "react";
import { Plus, Tag, AlignLeft, Briefcase, Users, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleFormProps {
    categories: any[];
    classes: any[];
    bases: any[];
    saveSchedule: (formData: FormData) => Promise<void>;
    updateSchedule?: (id: string, formData: FormData) => Promise<void>;
    initialData?: any;
    onCancel?: () => void;
}

export default function ScheduleForm({ categories, classes, bases, saveSchedule, updateSchedule, initialData, onCancel }: ScheduleFormProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Sync state with initialData when it changes
    React.useEffect(() => {
        if (initialData) {
            setSelectedCategoryId(initialData.category_id?.toString() || "");
            setSelectedClassIds(initialData.schedule_class_rooms?.map((p: any) => p.class_room_id?.toString()) || []);
            setSelectedDays([initialData.day_of_week]);
        } else {
            setSelectedCategoryId("");
            setSelectedClassIds([]);
            setSelectedDays([]);
        }
    }, [initialData]);

    const days = [
        "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
    ];

    const selectedCategory = categories.find(c => String(c.id) === selectedCategoryId);
    const isTeaching = selectedCategory?.is_teaching || false;

    function toggleDay(index: number) {
        setSelectedDays(prev =>
            prev.includes(index) ? prev.filter(x => x !== index) : [...prev, index]
        );
    }

    function toggleClass(id: string) {
        setSelectedClassIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    return (
        <section id="schedule-form" className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-fit">
            <h2 className="text-xl font-black text-slate-900 mb-6">
                {initialData ? "Edit Jadwal" : "Tambah Jadwal"}
            </h2>
            <form
                action={async (formData) => {
                    setLoading(true);
                    try {
                        if (initialData && updateSchedule) {
                            await updateSchedule(initialData.id, formData);
                            if (onCancel) onCancel();
                        } else {
                            await saveSchedule(formData);
                            setSelectedClassIds([]);
                            setSelectedDays([]);
                            setSelectedCategoryId("");
                        }
                    } finally {
                        setLoading(false);
                    }
                }}
                className="space-y-6"
            >
                {/* Hidden fields for multi-select */}
                <input type="hidden" name="class_room_ids" value={selectedClassIds.join(',')} />
                <input type="hidden" name="days_of_week" value={selectedDays.join(',')} />

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">Hari Pelaksanaan</label>
                    <div className="flex flex-wrap gap-2 px-1">
                        {days.map((day, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => toggleDay(i)}
                                className={cn(
                                    "h-10 px-4 rounded-xl text-[11px] font-black transition-all border-2",
                                    selectedDays.includes(i)
                                        ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100"
                                        : "bg-slate-50 text-slate-500 border-slate-50 hover:border-amber-200"
                                )}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">Kategori</label>
                    <div className="relative">
                        <select
                            name="category_id"
                            required
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer appearance-none"
                        >
                            <option value="">Pilih Kategori...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.is_teaching ? '📚 ' : '📋 '}{cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">Dasar Pelaksanaan</label>
                    <select
                        name="implementation_basis_id"
                        defaultValue={initialData?.implementation_basis_id || ""}
                        key={initialData?.implementation_basis_id || "empty"}
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer appearance-none"
                    >
                        <option value="">Pilih Dasar (Opsional)...</option>
                        {bases.map(base => (
                            <option key={base.id} value={base.id}>{base.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">Nama Mata Pelajaran (Subject)</label>
                    <input name="topic" type="text" defaultValue={initialData?.topic || ""} key={initialData?.topic || "empty"} placeholder="Misal: Informatika" className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-amber-500 transition-all" required />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">Keterangan / Uraian Kegiatan</label>
                    <textarea
                        name="description"
                        defaultValue={initialData?.description || ""}
                        key={initialData?.description || "empty"}
                        placeholder="Misal: Melaksanakan kegiatan belajar mengajar..."
                        className="w-full h-24 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                    ></textarea>
                </div>

                <div className="space-y-4 pt-2 group animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">
                            Kelas (Opsional)
                        </label>
                        <div className="flex flex-wrap gap-2 px-1">
                            {classes.map(cls => (
                                <button
                                    key={cls.id}
                                    type="button"
                                    onClick={() => toggleClass(String(cls.id))}
                                    className={cn(
                                        "h-10 px-4 rounded-xl text-[11px] font-black transition-all border-2",
                                        selectedClassIds.includes(String(cls.id))
                                            ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100"
                                            : "bg-slate-50 text-slate-500 border-slate-50 hover:border-amber-200"
                                    )}
                                >
                                    {cls.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 ml-1">Jam Pelajaran (JP) / Keterangan Waktu</label>
                        <input name="teaching_hours" type="text" defaultValue={initialData?.teaching_hours || ""} key={initialData?.teaching_hours || "empty"} placeholder="Misal: 1-4 atau 07:30" className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus size={18} /> {initialData ? "Perbarui Jadwal" : "Simpan Jadwal"}
                            </>
                        )}
                    </button>

                    {initialData && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full h-12 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}
