import React from "react";
import { Mail, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { APP_VERSION_LABEL } from "@/lib/version";

export default function ConfirmEmailPage() {
    return (
        <div className="flex min-h-[100dvh] bg-white overflow-hidden">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] bg-blue-500/10 rounded-full blur-[80px]" />

                <div className="relative z-10 max-w-lg w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles size={12} />
                        Pendaftaran berhasil
                    </div>

                    <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Satu Langkah<br />
                        <span className="text-amber-500 text-6xl italic leading-tight">Lagi!</span>
                    </h1>

                    <p className="text-base text-slate-400 font-medium leading-relaxed mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-sm">
                        Kami telah mengirimkan email verifikasi. Konfirmasi email Anda untuk mengaktifkan akun dan mulai menggunakan semua fitur.
                    </p>

                    {/* Steps */}
                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        {[
                            { step: "01", label: "Buka Email", desc: "Cek inbox atau folder spam", done: true },
                            { step: "02", label: "Klik Verifikasi", desc: "Klik tombol di email", done: false },
                            { step: "03", label: "Masuk & Mulai", desc: "Login dan pilih sekolah", done: false },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <div className={`h-10 w-10 rounded-xl ${item.done ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5 border-white/10'} border flex items-center justify-center shrink-0 transition-all duration-300`}>
                                    {item.done ? (
                                        <CheckCircle2 size={18} className="text-green-400" />
                                    ) : (
                                        <span className="text-amber-500 text-xs font-black">{item.step}</span>
                                    )}
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
                    <p className="text-slate-600 text-xs font-black tracking-[0.3em] uppercase">{APP_VERSION_LABEL}</p>
                </div>
            </div>

            {/* Right Side: Confirmation Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-slate-50/50 relative">
                <div className="max-w-md w-full mx-auto flex flex-col items-center text-center">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-6 flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-200">
                            <span className="text-xl font-black italic">njk</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            NewJurnalku
                        </h2>
                    </div>

                    {/* Success Animation */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px] animate-pulse" />
                        <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 flex items-center justify-center shadow-xl shadow-green-100/50">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-300/50 animate-in zoom-in-50 duration-500">
                                <Mail className="h-9 w-9 text-white" />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        Cek Email Anda!
                    </h2>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-xs animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
                        Kami telah mengirimkan link verifikasi ke email yang Anda daftarkan. Klik link tersebut untuk mengaktifkan akun Anda.
                    </p>

                    {/* Info Cards */}
                    <div className="w-full space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-left">
                                <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Tips</p>
                                <p className="text-xs text-amber-700 font-medium mt-0.5">Periksa juga folder <span className="font-bold">Spam</span> atau <span className="font-bold">Junk</span> jika email tidak ditemukan di inbox.</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-left">
                                <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Setelah verifikasi</p>
                                <p className="text-xs text-blue-700 font-medium mt-0.5">Anda akan diminta untuk memilih atau membuat sekolah sebelum bisa menggunakan aplikasi.</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all hover:bg-slate-800 animate-in fade-in slide-in-from-bottom-10 duration-500 delay-300"
                    >
                        <span>Ke Halaman Login</span>
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    {/* Mobile version */}
                    <div className="lg:hidden mt-12 text-center w-full">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{APP_VERSION_LABEL}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
