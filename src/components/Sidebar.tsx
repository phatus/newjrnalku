"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BarChart2, User as UserIcon, PlusCircle, LogOut, Settings, Shield, Database, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions";
import { APP_VERSION_LABEL } from "@/lib/version";
import type { Profile, User } from "@/types";

const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Kegiatan Harian", href: "/activities", icon: ClipboardList },
    { name: "Kelola Jadwal", href: "/activities/schedule", icon: Settings },
    { name: "Pusat Laporan", href: "/reports", icon: BarChart2 },
    { name: "Data Master", href: "/master-data", icon: Database },
    { name: "Profil Saya", href: "/profile", icon: UserIcon },
];

interface SidebarProps {
    user: User | null;
    profile: Profile | null;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export default function Sidebar({ user, profile, isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    if (!user) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: "@media print { aside { display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; } }" }} />
            <aside
                className={cn(
                    "fixed left-0 top-0 bottom-0 z-40 hidden flex-col border-r border-slate-200 bg-white sm:flex transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                {/* Toggle Button */}
                {toggleCollapse && (
                    <button
                        onClick={toggleCollapse}
                        className="absolute -right-3 top-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-amber-600 z-50 transition-transform"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                )}

                {/* Logo */}
                <div className={cn("flex h-20 items-center", isCollapsed ? "justify-center px-0" : "px-8")}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200" title={isCollapsed ? "newjurnalku" : undefined}>
                            <span className="text-xl font-bold italic">njk</span>
                        </div>
                        {!isCollapsed && <span className="text-xl font-black tracking-tight text-slate-900 line-clamp-1">newjurnalku</span>}
                    </div>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 space-y-1.5 px-4 pt-4">
                    <Link
                        href="/activities/create"
                        className={cn(
                            "flex w-full items-center rounded-2xl bg-amber-500 py-4 text-sm font-bold text-white shadow-lg shadow-amber-100 transition-all hover:bg-amber-600 active:scale-[0.98] mb-6",
                            isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                        )}
                        title={isCollapsed ? "Tambah Kegiatan" : undefined}
                    >
                        <PlusCircle size={20} className="shrink-0" />
                        {!isCollapsed && <span>Tambah Kegiatan</span>}
                    </Link>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-xl py-3.5 text-sm font-bold transition-all group",
                                    isCollapsed ? "justify-center px-0" : "gap-3 px-4",
                                    isActive
                                        ? "bg-amber-50 text-amber-600"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon size={20} className={cn("transition-transform group-hover:scale-110 shrink-0", isActive && "text-amber-600")} />
                                {!isCollapsed && <span>{item.name}</span>}
                                {isActive && !isCollapsed && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                                )}
                            </Link>
                        );
                    })}

                    {profile?.role && ['admin', 'super_admin'].includes(profile.role) && (
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center rounded-xl py-3.5 text-sm font-bold transition-all group mt-4 border border-dashed border-slate-200",
                                isCollapsed ? "justify-center px-0" : "gap-3 px-4",
                                pathname.startsWith('/admin')
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                            title={isCollapsed ? "Panel Admin" : undefined}
                        >
                            <Shield size={20} className={cn("transition-transform group-hover:scale-110 shrink-0", pathname.startsWith('/admin') && "text-amber-400")} />
                            {!isCollapsed && <span>Panel Admin</span>}
                        </Link>
                    )}

                    {profile?.role === 'super_admin' && (
                        <Link
                            href="/super-admin"
                            className={cn(
                                "flex items-center rounded-xl py-3.5 text-sm font-bold transition-all group mt-2 border border-dashed border-indigo-200",
                                isCollapsed ? "justify-center px-0" : "gap-3 px-4",
                                pathname.startsWith('/super-admin')
                                    ? "bg-indigo-600 text-white"
                                    : "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                            )}
                            title={isCollapsed ? "Super Admin" : undefined}
                        >
                            <Globe size={20} className={cn("transition-transform group-hover:scale-110 shrink-0", pathname.startsWith('/super-admin') && "text-amber-300")} />
                            {!isCollapsed && <span>Super Admin</span>}
                        </Link>
                    )}
                </nav>

                {/* Footer Nav */}
                <div className="border-t border-slate-100 p-4 space-y-1.5">

                    <button
                        onClick={() => logout()}
                        className={cn(
                            "flex w-full items-center rounded-xl py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 group",
                            isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                        )}
                        title={isCollapsed ? "Keluar" : undefined}
                    >
                        <LogOut size={20} className="transition-transform group-hover:-translate-x-1 shrink-0" />
                        {!isCollapsed && <span>Keluar</span>}
                    </button>
                </div>

                {/* Version */}
                <div className="px-6 pb-4 pt-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">
                        {isCollapsed ? "v" + APP_VERSION_LABEL.split(" ")[0].replace("V", "") : APP_VERSION_LABEL}
                    </p>
                </div>

            </aside>
        </>
    );
}
