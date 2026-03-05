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
                        Trusted by Teachers
                    </div>

                    <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Satu Platform,<br />
                        <span className="text-amber-500 text-6xl italic leading-tight">Solusi Terpadu.</span>
                    </h1>

                    <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Optimalkan pelaporan Anda. Tiga laporan utama otomatis dalam satu aplikasi yang dirancang khusus untuk efisiensi guru.
                    </p>

                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        {[
                            { icon: BookOpen, label: "Jurnal Harian", desc: "Catat aktivitas mendetail setiap hari" },
                            { icon: Layout, label: "Rekap Mengajar", desc: "Automasi laporan kelas dan siswa" },
                            { icon: BarChart3, label: "Poin Kinerja", desc: "Pantau pencapaian RHK secara real-time" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-bold tracking-tight">{item.label}</p>
                                    <p className="text-slate-500 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 left-12">
                    <p className="text-slate-600 text-sm font-bold tracking-widest uppercase">NewJurnalku v1.0.0 &copy; 2026</p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-20 bg-slate-50/50 relative">
                <div className="max-w-md w-full mx-auto">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-12 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <span className="text-xl font-black italic">njk</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            NewJurnalku
                        </h2>
                    </div>

                    <div className="mb-10 lg:mb-12">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang</h2>
                        <p className="text-slate-500 font-medium">Lanjutkan produktivitas Anda hari ini.</p>
                    </div>

                    {message && (
                        <div className={cn(
                            "mb-8 p-5 rounded-[1.5rem] border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500",
                            type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                        )}>
                            {type === 'error' ? (
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-black tracking-tight uppercase leading-relaxed">{message}</p>
                        </div>
                    )}

                    <form action={login} onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Sekolah</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="nama@sekolah.id"
                                    required
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Kata Sandi</label>
                                <Link href="/forgot-password" title="Lupa Kata Sandi" className="text-[11px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors">Lupa sandi?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-amber-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 hover:bg-amber-600"
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

                    <div className="mt-12 text-center">
                        <p className="text-sm font-bold text-slate-400">
                            Belum punya akun? <Link href="/register" title="Daftar Akun" className="text-amber-600 hover:text-amber-700 underline underline-offset-4 decoration-2 transition-all">Daftar secara gratis</Link>
                        </p>
                    </div>
                </div>

                {/* Mobile version copyright */}
                <div className="lg:hidden absolute bottom-8 left-0 w-full text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">NewJurnalku v1.0.0 &copy; 2026</p>
                </div>
            </div>
        </div>
    );
}
