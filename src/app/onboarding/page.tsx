"use client";

import React, { useState } from "react";
import { Building2, Users, Loader2, ArrowRight, AlertCircle, CheckCircle2, KeyRound, MapPin, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createSchool, joinSchool } from "./actions";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const type = searchParams.get("type");
    const initialTab = searchParams.get("tab") || "create";

    const [activeTab, setActiveTab] = useState<"create" | "join">(initialTab as "create" | "join");
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        setLoading(true);
    };

    return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-200 mb-5">
                        <Sparkles size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang!</h1>
                    <p className="text-slate-500 font-medium mt-2">Satu langkah lagi untuk memulai perjalanan Anda.</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={cn(
                        "mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500",
                        type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                    )}>
                        {type === 'error' ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{message}</p>
                    </div>
                )}

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm mb-8">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all",
                            activeTab === "create"
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <Building2 size={18} />
                        Buat Sekolah Baru
                    </button>
                    <button
                        onClick={() => setActiveTab("join")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all",
                            activeTab === "join"
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <Users size={18} />
                        Gabung Sekolah
                    </button>
                </div>

                {/* Create School Form */}
                {activeTab === "create" && (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">Daftarkan Sekolah</h2>
                                <p className="text-xs text-slate-400 font-medium">Anda akan menjadi Admin sekolah ini.</p>
                            </div>
                        </div>

                        <form action={createSchool} onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Sekolah *</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="school_name"
                                        placeholder="Contoh: SMK Negeri 1 Jakarta"
                                        required
                                        className="w-full h-13 pl-12 pr-5 rounded-xl border-none bg-slate-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Alamat Sekolah</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                    <textarea
                                        name="school_address"
                                        placeholder="Alamat lengkap (opsional)"
                                        rows={2}
                                        className="w-full pl-12 pr-5 py-3 rounded-xl border-none bg-slate-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300 resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-amber-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-70 hover:bg-amber-600"
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Buat Sekolah</span><ArrowRight size={18} /></>}
                            </button>
                        </form>
                    </div>
                )}

                {/* Join School Form */}
                {activeTab === "join" && (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">Gabung ke Sekolah</h2>
                                <p className="text-xs text-slate-400 font-medium">Masukkan kode undangan dari Admin sekolah Anda.</p>
                            </div>
                        </div>

                        <form action={joinSchool} onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kode Undangan *</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        type="text"
                                        name="invite_code"
                                        placeholder="Contoh: a1b2c3d4"
                                        required
                                        className="w-full h-13 pl-12 pr-5 rounded-xl border-none bg-slate-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 font-black text-lg tracking-[0.3em] uppercase placeholder:font-medium placeholder:text-slate-300 placeholder:text-sm placeholder:tracking-normal placeholder:normal-case"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-70 hover:bg-slate-800"
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Gabung Sekolah</span><ArrowRight size={18} /></>}
                            </button>
                        </form>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-10">
                    NewJurnalku v2.0 &copy; 2026
                </p>
            </div>
        </div>
    );
}
