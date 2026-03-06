"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BarChart2, User, PlusCircle, LogOut, Settings, Shield, Database } from "lucide-react";
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

                    {profile?.role === 'admin' && (
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
                </nav>

                {/* Footer Nav */}
                <div className="border-t border-slate-100 p-4 space-y-1.5">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all group",
                            pathname === '/settings' ? "bg-slate-50 text-amber-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <Settings size={20} className={cn("transition-transform group-hover:rotate-45", pathname === '/settings' && "text-amber-600")} />
                        <span>Pengaturan</span>
                    </Link>
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 group"
                    >
                        <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
                        <span>Keluar</span>
                    </button>
                </div>

                {/* User Mini Profile */}
                <div className="p-4 pt-0">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm">
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || user?.email}`}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{profile?.name || user?.email?.split('@')[0]}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{profile?.role || 'Pengguna'}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
