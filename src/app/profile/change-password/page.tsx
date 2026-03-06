
import React from "react";
import { ChevronLeft, Save, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { changePassword } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

export default async function ChangePasswordPage(props: {
    searchParams: Promise<{ message?: string; type?: string }>;
}) {
    const searchParams = await props.searchParams;
    const message = searchParams.message;
    const type = searchParams.type;

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/profile"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Keamanan</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ubah Kata Sandi</h1>
                <p className="text-slate-500 mt-1 font-medium">Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda.</p>
            </div>

            <div className="max-w-2xl mx-auto w-full px-6 sm:px-10 mt-10">
                {message && (
                    <div className={cn(
                        "mb-8 p-6 rounded-[2rem] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                        type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                    )}>
                        <AlertCircle className="shrink-0" />
                        <p className="text-sm font-black uppercase tracking-tight">{message}</p>
                    </div>
                )}

                <form action={changePassword} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                    <div className="space-y-6">
                        {/* Kata Sandi Baru */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Minimal 6 karakter"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Konfirmasi Kata Sandi */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi Baru</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirm_password"
                                    required
                                    placeholder="Ulangi kata sandi baru"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.97] transition-all group"
                        >
                            <Save size={22} className="group-hover:rotate-12 transition-transform" />
                            <span>PERBARUI KATA SANDI</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
