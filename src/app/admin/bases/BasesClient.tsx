"use client";

import React, { useState } from "react";
import { ChevronLeft, Plus, Trash2, FileText, Loader2, X } from "lucide-react";
import Link from "next/link";
import { createBase, deleteBase } from "@/app/admin/actions";
import { toast } from 'sonner';
import type { ImplementationBase } from "@/types";

export default function BasesClient({ initialBases }: { initialBases: ImplementationBase[] }) {
    const [bases, setBases] = useState(initialBases);
    const [isAdding, setIsAdding] = useState(false);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            await createBase(formData);
            toast.success('Dasar pelaksanaan berhasil ditambahkan');
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Hapus dasar pelaksanaan ini?")) return;
        setLoadingId(id);
        try {
            await deleteBase(id);
            setBases(bases.filter(b => b.id !== id));
            toast.success('Dasar pelaksanaan berhasil dihapus');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/admin"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Master Data</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dasar Pelaksanaan</h1>
                        <p className="text-slate-500 mt-1 font-medium">Kelola jenis SK atau perintah tugas.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3"
                    >
                        <Plus size={20} />
                        Tambah Dasar
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-6 sm:px-10 mt-10">
                {isAdding && (
                    <div className="mb-10 bg-white rounded-[2.5rem] p-8 border-2 border-amber-500 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tambah Dasar Baru</h2>
                            <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Dasar Pelaksanaan</label>
                                <input name="name" required className="w-full h-12 px-5 rounded-xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500" placeholder="Contoh: SK Tugas Mengajar" />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="h-12 px-10 rounded-xl bg-amber-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-600">Simpan Dasar</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Jenis Dasar</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bases.map((base) => (
                                <tr key={base.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-bold text-slate-900">{base.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleDelete(base.id)}
                                            disabled={loadingId === base.id}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                        >
                                            {loadingId === base.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
