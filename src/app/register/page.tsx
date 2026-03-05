"use client";

import React, { useState } from "react";
import { Mail, Lock, User, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
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
        <div className="flex flex-col min-h-[100dvh] px-6 pt-12 pb-8 bg-slate-50">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="mb-10 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-200 mb-6">
                        <span className="text-2xl font-bold italic">njk</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Daftar Akun Baru</h1>
                    <p className="text-slate-500 mt-2">Mulai kelola jurnal mengajar Anda sekarang</p>
                </div>

                {message && (
                    <div className={cn(
                        "mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                        type === 'error' ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"
                    )}>
                        {type === 'error' ? (
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                <form action={register} onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Nama Lengkap</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Masukkan nama lengkap"
                                required
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                placeholder="nama@sekolah.id"
                                required
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Kata Sandi</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Pilih kata sandi minimal 6 karakter"
                                required
                                minLength={6}
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Daftar Sekarang</span>
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Sudah punya akun? <Link href="/login" className="font-bold text-amber-600 hover:text-amber-700">Masuk di sini</Link>
                </div>
            </div>

            <div className="mt-auto text-center">
                <p className="text-xs text-slate-400">newjurnalku v1.0.0 &copy; 2026</p>
            </div>
        </div>
    );
}
