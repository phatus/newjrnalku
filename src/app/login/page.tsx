"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2, Layout, BookOpen, BarChart3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const message = searchParams.get("message") || searchParams.get("error");
    const type = searchParams.get("type") || (searchParams.get("error") ? "error" : "success");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
    };

    return (
        <div className="flex min-h-[100dvh] bg-white overflow-hidden">
            {/* Left Side: Branding & Slogan (Visible only on desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

                <div className="relative z-10 max-w-lg w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <ShieldCheck size={14} />
                        Smart Efficient Reliable
                    </div>

                    <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Sekali Catat,<br />
                        <span className="text-amber-500 text-7xl italic leading-tight">3 Laporan Tuntas.</span>
                    </h1>

                    <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Hemat waktu pelaporan Anda. Satu entri jurnal menghasilkan Jurnal Harian, Rekap Mengajar, dan Poin Kinerja secara instan.
                    </p>

                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        {[
                            { icon: BookOpen, label: "Jurnal Harian", desc: "Automasi catatan aktivitas harian" },
                            { icon: Layout, label: "Rekap Mengajar", desc: "Laporan kelas & siswa otomatis" },
                            { icon: BarChart3, label: "Poin Kinerja", desc: "Pantau pencapaian poin real-time" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-bold tracking-tight">{item.label}</p>
                                    <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 left-12">
                    <p className="text-slate-600 text-xs font-black tracking-[0.3em] uppercase">NewJurnalku v1.0.1 &copy; 2026</p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-slate-50/50 relative">
                <div className="max-w-md w-full mx-auto flex flex-col items-center lg:items-start text-center lg:text-left">
                    {/* Mobile Logo Only */}
                    <div className="lg:hidden mb-12 flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-3xl bg-amber-500 flex items-center justify-center text-white shadow-2xl shadow-amber-200">
                            <span className="text-2xl font-black italic">njk</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            NewJurnalku
                        </h2>
                    </div>

                    <div className="mb-10 lg:mb-12">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Masuk</h2>
                        <p className="text-slate-500 font-medium">Silakan masuk untuk melanjutkan.</p>
                    </div>

                    {message && (
                        <div className={cn(
                            "w-full mb-8 p-5 rounded-[1.5rem] border flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                            type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                        )}>
                            {type === 'error' ? (
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                            )}
                            <p className="text-xs font-black tracking-widest uppercase leading-relaxed">{message}</p>
                        </div>
                    )}

                    <form action={login} onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Sekolah</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="nama@sekolah.id"
                                    required
                                    className="w-full h-15 pl-14 pr-5 rounded-2xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kata Sandi</label>
                                <Link href="/forgot-password" title="Lupa Kata Sandi" className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors">Lupa?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-15 pl-14 pr-5 rounded-2xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-15 flex items-center justify-center gap-4 rounded-2xl bg-amber-500 text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 hover:bg-amber-600"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Masuk Sekarang</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center w-full">
                        <p className="text-sm font-bold text-slate-400">
                            Belum punya akun? <Link href="/register" title="Daftar Akun" className="text-amber-600 hover:text-amber-700 border-b-2 border-amber-600/30 transition-all font-black uppercase tracking-widest text-xs py-1">Daftar di sini</Link>
                        </p>
                    </div>

                    {/* Mobile version copyright */}
                    <div className="lg:hidden mt-20 text-center w-full">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">NewJurnalku v1.0.1 &copy; 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
