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
        <div className="flex flex-col min-h-[100dvh] bg-slate-50 relative overflow-x-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 w-full">
                <div className="max-w-md w-full py-12">
                    {/* Logo Section */}
                    <div className="mb-12 flex flex-col items-center gap-6">
                        <div className="h-20 w-20 rounded-3xl bg-amber-500 flex items-center justify-center text-white shadow-2xl shadow-amber-200 animate-in zoom-in duration-700">
                            <span className="text-3xl font-black italic">njk</span>
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                Satu Platform,<br />
                                <span className="text-amber-500 italic">Solusi Terpadu.</span>
                            </h1>
                            <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm leading-relaxed uppercase tracking-wider">
                                Optimalkan pelaporan Anda dalam satu aplikasi efisien.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white relative group">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Masuk Kembali</h2>
                            <p className="text-slate-400 text-sm font-medium">Lanjutkan produktivitas harian Anda.</p>
                        </div>

                        {message && (
                            <div className={cn(
                                "mb-8 p-5 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500",
                                type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                            )}>
                                {type === 'error' ? (
                                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                )}
                                <p className="text-xs font-black tracking-tight uppercase leading-relaxed">{message}</p>
                            </div>
                        )}

                        <form action={login} onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Sekolah</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within/input:text-amber-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="nama@sekolah.id"
                                        required
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kata Sandi</label>
                                    <Link href="/forgot-password" title="Lupa Kata Sandi" className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors">Lupa sandi?</Link>
                                </div>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within/input:text-amber-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300 shadow-inner"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 hover:bg-slate-800"
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

                        <div className="mt-10 text-center">
                            <p className="text-xs font-bold text-slate-400">
                                Belum punya akun? <Link href="/register" title="Daftar Akun" className="text-amber-600 hover:text-amber-700 font-black uppercase tracking-widest transition-all ml-1">Daftar Gratis</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Version Section with more breathing room */}
            <div className="w-full py-12 text-center mt-auto animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-400 transition-colors cursor-default">
                    NEWJURNALKU V1.0.1 <span className="mx-2 text-slate-200">|</span> &copy; 2026
                </p>
            </div>
        </div>
    );
}
