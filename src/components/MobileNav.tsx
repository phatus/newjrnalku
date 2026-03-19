"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BarChart2, User as UserIcon, PlusCircle, CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Kegiatan", href: "/activities", icon: ClipboardList },
    { name: "Hari Libur", href: "/activities/holidays", icon: CalendarOff },
    { name: "Tambah", href: "/activities/create", icon: PlusCircle, isSpecial: true },
    { name: "Laporan", href: "/reports", icon: BarChart2 },
    { name: "Profil", href: "/profile", icon: UserIcon },
];

import type { User } from "@/types";

interface MobileNavProps {
    user: User | null;
}

export default function MobileNav({ user }: MobileNavProps) {
    const pathname = usePathname();

    if (!user) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: "@media print { nav { display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; } }" }} />
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-200 pb-safe sm:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isSpecial) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-200 transition-transform active:scale-90"
                            >
                                <Icon size={28} />
                                <span className="sr-only">{item.name}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors",
                                isActive ? "text-amber-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Icon size={24} className={cn("transition-transform", isActive && "scale-110")} />
                            <span className="text-[10px] font-medium leading-none">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
        </>
    );
}
