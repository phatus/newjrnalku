"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2, User, ShieldCheck, BookOpen, Layout, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { register } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const type = searchParams.get("type");

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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <ShieldCheck size={12} />
                        Join the community
                    </div>

                    <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Satu Pintu,<br />
                        <span className="text-amber-500 text-6xl italic leading-tight">Beragam Solusi.</span>
                    </h1>

                    <p className="text-base text-slate-400 font-medium leading-relaxed mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-sm">
                        Automasi administrasi Anda sekarang. Satu pendaftaran membuka akses ke semua fitur pelaporan otomatis kami.
                    </p>

                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        {[
                            { icon: BookOpen, label: "Lengkapi Profil", desc: "Data guru & jadwal" },
                            { icon: Layout, label: "Mulai Mencatat", desc: "Sistem cerdas jurnal" },
                            { icon: BarChart3, label: "Terima Laporan", desc: "Download rekap instan" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shrink-0">
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold tracking-tight">{item.label}</p>
                                    <p className="text-slate-500 text-[11px] font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 left-12">
                    <p className="text-slate-600 text-xs font-black tracking-[0.3em] uppercase">NewJurnalku v1.0.1 &copy; 2026</p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-slate-50/50 relative">
                <div className="max-w-md w-full mx-auto flex flex-col items-center lg:items-start text-center lg:text-left">
                    {/* Mobile Logo Only */}
                    <div className="lg:hidden mb-8 flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-200">
                            <span className="text-xl font-black italic">njk</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            NewJurnalku
                        </h2>
                    </div>

                    <div className="mb-8 lg:mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Daftar</h2>
                        <p className="text-slate-500 text-sm font-medium">Mulai efisiensi kerja Anda hari ini.</p>
                    </div>

                    {message && (
                        <div className={cn(
                            "w-full mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500",
                            type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                        )}>
                            {type === 'error' ? (
                                <AlertCircle className="h-5 w-5 shrink-0" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                            )}
                            <p className="text-[10px] font-black tracking-widest uppercase leading-relaxed">{message}</p>
                        </div>
                    )}

                    <form action={register} onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    name="full_name"
                                    placeholder="Nama Lengkap Anda"
                                    required
                                    className="w-full h-13 pl-14 pr-5 rounded-xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Sekolah</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="nama@sekolah.id"
                                    required
                                    className="w-full h-13 pl-14 pr-5 rounded-xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kata Sandi</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full h-13 pl-14 pr-5 rounded-xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 flex items-center justify-center gap-4 rounded-xl bg-amber-500 text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 hover:bg-amber-600"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Daftar Sekarang</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center w-full">
                        <p className="text-sm font-bold text-slate-400">
                            Sudah punya akun? <Link href="/login" title="Masuk" className="text-amber-600 hover:text-amber-700 border-b-2 border-amber-600/30 transition-all font-black uppercase tracking-widest text-xs py-1">Masuk Sekarang</Link>
                        </p>
                    </div>

                    {/* Mobile version copyright */}
                    <div className="lg:hidden mt-12 text-center w-full">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">NewJurnalku v1.0.1 &copy; 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
