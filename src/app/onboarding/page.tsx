"use client";

import React, { useState } from "react";
import { Building2, Users, Loader2, ArrowRight, AlertCircle, CheckCircle2, KeyRound, MapPin, Sparkles, Search, Hash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createSchool, joinSchool } from "./actions";
import { cn } from "@/lib/utils";
import { APP_VERSION_LABEL } from "@/lib/version";

export default function OnboardingPage() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const type = searchParams.get("type");
    const initialTab = searchParams.get("tab") || "create";

    const [activeTab, setActiveTab] = useState<"create" | "join">(initialTab as "create" | "join");
    const [loading, setLoading] = useState(false);

    // NPSN lookup state
    const [npsn, setNpsn] = useState("");
    const [npsnLoading, setNpsnLoading] = useState(false);
    const [schoolData, setSchoolData] = useState<{ name: string; address: string | null; type: string | null } | null>(null);
    const [npsnError, setNpsnError] = useState("");
    const [npsnVerified, setNpsnVerified] = useState(false);

    const handleSubmit = () => {
        setLoading(true);
    };

    const handleNpsnLookup = async () => {
        const trimmed = npsn.trim();
        if (trimmed.length < 8) {
            setNpsnError("NPSN harus 8 digit");
            return;
        }

        setNpsnLoading(true);
        setNpsnError("");
        setSchoolData(null);
        setNpsnVerified(false);

        try {
            const res = await fetch(`/api/npsn?npsn=${trimmed}`);
            const data = await res.json();

            if (data.found) {
                setSchoolData({ name: data.name, address: data.address, type: data.type });
                setNpsnVerified(true);
            } else if (data.error) {
                setNpsnError(data.error);
            } else {
                setNpsnError("Sekolah tidak ditemukan. Pastikan NPSN benar.");
            }
        } catch {
            setNpsnError("Gagal menghubungi server. Coba lagi.");
        } finally {
            setNpsnLoading(false);
        }
    };

    const handleNpsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
        setNpsn(val);
        setNpsnVerified(false);
        setSchoolData(null);
        setNpsnError("");
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
                                <p className="text-xs text-slate-400 font-medium">Masukkan NPSN untuk menemukan sekolah Anda.</p>
                            </div>
                        </div>

                        {/* NPSN Lookup */}
                        <div className="space-y-4 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">NPSN (Nomor Pokok Sekolah Nasional) *</label>
                                <div className="flex gap-2">
                                    <div className="relative group flex-1">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={npsn}
                                            onChange={handleNpsnChange}
                                            placeholder="Contoh: 20508816"
                                            maxLength={8}
                                            className="w-full h-13 pl-12 pr-5 rounded-xl border-none bg-slate-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-black text-lg tracking-[0.2em] placeholder:font-medium placeholder:text-slate-300 placeholder:text-sm placeholder:tracking-normal"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleNpsnLookup}
                                        disabled={npsnLoading || npsn.length < 8}
                                        className="h-13 px-5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                    >
                                        {npsnLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search size={18} />}
                                        <span className="hidden sm:inline">Cari</span>
                                    </button>
                                </div>
                            </div>

                            {/* NPSN Error */}
                            {npsnError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 animate-in fade-in duration-300">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-600">{npsnError}</p>
                                </div>
                            )}

                            {/* School Data Found */}
                            {npsnVerified && schoolData && (
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Sekolah Ditemukan</p>
                                    </div>
                                    <p className="text-base font-black text-green-900 tracking-tight">{schoolData.name}</p>
                                    {schoolData.type && <p className="text-xs text-green-700 font-medium mt-1">{schoolData.type}</p>}
                                    {schoolData.address && <p className="text-xs text-green-600 mt-1">{schoolData.address}</p>}
                                </div>
                            )}
                        </div>

                        <form action={createSchool} onSubmit={handleSubmit} className="space-y-5">
                            <input type="hidden" name="npsn" value={npsn} />
                            <input type="hidden" name="school_name" value={schoolData?.name || ""} />
                            <input type="hidden" name="school_address" value={schoolData?.address || ""} />

                            {/* Manual name input (only if NPSN lookup failed but user wants to enter manually) */}
                            {!npsnVerified && npsn.length === 8 && npsnError && (
                                <div className="space-y-4 p-4 rounded-xl bg-amber-50 border border-amber-100 animate-in fade-in duration-300">
                                    <p className="text-xs font-bold text-amber-800">
                                        NPSN tidak ditemukan di database Kemdikbud. Anda bisa memasukkan nama sekolah secara manual:
                                    </p>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] ml-1">Nama Sekolah (Manual) *</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-300 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="school_name_manual"
                                                placeholder="Contoh: SMK Negeri 1 Jakarta"
                                                required
                                                className="w-full h-13 pl-12 pr-5 rounded-xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] ml-1">Alamat Sekolah</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-amber-300 group-focus-within:text-amber-500 transition-colors" />
                                            <textarea
                                                name="school_address_manual"
                                                placeholder="Alamat lengkap (opsional)"
                                                rows={2}
                                                className="w-full pl-12 pr-5 py-3 rounded-xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (!npsnVerified && !npsnError)}
                                className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-amber-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-70 hover:bg-amber-600"
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Daftarkan Sekolah</span><ArrowRight size={18} /></>}
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
                    {APP_VERSION_LABEL}
                </p>
            </div>
        </div>
    );
}
