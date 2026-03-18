"use client";
import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Profile, User } from "@/types";

interface UserIdentityProps {
    profile: Profile | null;
    user: User;
    className?: string;
}

export default function UserIdentity({ profile, user, className }: UserIdentityProps) {
    const [avatarError, setAvatarError] = useState(false);

    if (!user && !profile) return null;

    const name = profile?.name || user?.email?.split('@')[0];
    const role = profile?.role || 'Pengguna';
    const avatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    // If error loading avatar, fallback to dicebear with name seed
    const finalAvatar = avatarError ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` : avatar;

    return (
        <div className={cn("flex items-center gap-4 py-1", className)}>
            <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-tight tracking-tight">{name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{role}</p>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-[1.25rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex-shrink-0 transition-all hover:scale-105 p-1.5 relative group">
                <div className="h-full w-full rounded-[0.85rem] overflow-hidden bg-slate-50 relative">
                    <Image
                        src={finalAvatar}
                        alt="Avatar"
                        width={56}
                        height={56}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        onError={() => setAvatarError(true)}
                        unoptimized
                    />
                </div>
                <div className="absolute inset-0 rounded-[1.25rem] border border-black/5 pointer-events-none" />
            </div>
        </div>
    );
}
