"use client";

import React, { useState } from "react";
import { Plus, Trash2, Info, Layers, CheckCircle2 } from "lucide-react";
import { createClassRoom, deleteClassRoom } from "../actions";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import type { ClassRoom } from "@/types";

interface ClassesClientProps {
    allClassRooms: ClassRoom[];
    userOnlyClassRooms: ClassRoom[];
}

export default function ClassesClient({ allClassRooms, userOnlyClassRooms }: ClassesClientProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await createClassRoom(formData);
            toast.success('Kelas berhasil ditambahkan');
            setIsAdding(false);
        } catch (error: any) {
            console.error("Error saving class:", error);
            toast.error(error.message || "Gagal menyimpan kelas.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus kelas ini?")) return;
        setIsLoading(true);
        try {
            await deleteClassRoom(id);
            toast.success('Kelas berhasil dihapus');
        } catch (error: any) {
            console.error("Error deleting class:", error);
            toast.error(error.message || "Gagal menghapus kelas.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                    <Info size={18} />
                    <p className="text-xs font-bold uppercase tracking-wider">Kelola Kelas Pribadi</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Tambah Kelas</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allClassRooms.map((cls) => {
                    const isUserOwned = userOnlyClassRooms.some(u => u.id === cls.id);
                    return (
                        <div
                            key={cls.id}
                            className={cn(
                                "group flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all",
                                isUserOwned && "border-blue-100 bg-blue-50/10"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"
                                )}>
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 uppercase tracking-tight">{cls.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        {isUserOwned ? "Milik Anda" : "Data Sistem"}
                                    </p>
                                </div>
                            </div>

                            {isUserOwned && (
                                <button
                                    onClick={() => handleDelete(cls.id)}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tambah Kelas</h2>
                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Contoh: X TKJ 1</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kelas</label>
                                <input
                                    name="name"
                                    required
                                    autoFocus
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-center uppercase"
                                    placeholder="NAMA KELAS"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] h-14 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan Kelas"}
                                    {!isLoading && <CheckCircle2 size={16} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
