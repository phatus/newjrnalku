"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BarChart2, User, PlusCircle, LogOut, Settings, Shield, Database, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions";

const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Kegiatan Harian", href: "/activities", icon: ClipboardList },
    { name: "Pusat Laporan", href: "/reports", icon: BarChart2 },
    { name: "Data Master", href: "/master-data", icon: Database },
    { name: "Profil Saya", href: "/profile", icon: User },
];

interface SidebarProps {
    user: any;
    profile: any;
}

export default function Sidebar({ user, profile }: SidebarProps) {
    const pathname = usePathname();

    if (!user) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: "@media print { aside { display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; } }" }} />
            <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 flex-col border-r border-slate-200 bg-white sm:flex">
                {/* Logo */}
                <div className="flex h-20 items-center px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                            <span className="text-xl font-bold italic">njk</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900">newjurnalku</span>
                    </div>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 space-y-1.5 px-4 pt-4">
                    <Link
                        href="/activities/create"
                        className="flex w-full items-center gap-3 rounded-2xl bg-amber-500 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-amber-100 transition-all hover:bg-amber-600 active:scale-[0.98] mb-6"
                    >
                        <PlusCircle size={20} />
                        <span>Tambah Kegiatan</span>
                    </Link>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all group",
                                    isActive
                                        ? "bg-amber-50 text-amber-600"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-amber-600")} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                                )}
                            </Link>
                        );
                    })}

                    {['admin', 'super_admin'].includes(profile?.role) && (
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all group mt-4 border border-dashed border-slate-200",
                                pathname.startsWith('/admin')
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Shield size={20} className={cn("transition-transform group-hover:scale-110", pathname.startsWith('/admin') && "text-amber-400")} />
                            <span>Panel Admin</span>
                        </Link>
                    )}

                    {profile?.role === 'super_admin' && (
                        <Link
                            href="/super-admin"
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all group mt-2 border border-dashed border-indigo-200",
                                pathname.startsWith('/super-admin')
                                    ? "bg-indigo-600 text-white"
                                    : "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                            )}
                        >
                            <Globe size={20} className={cn("transition-transform group-hover:scale-110", pathname.startsWith('/super-admin') && "text-amber-300")} />
                            <span>Super Admin</span>
                        </Link>
                    )}
                </nav>

                {/* Footer Nav */}
                <div className="border-t border-slate-100 p-4 space-y-1.5">

                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 group"
                    >
                        <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
                        <span>Keluar</span>
                    </button>
                </div>


            </aside>
        </>
    );
}
