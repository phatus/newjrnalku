"use client";

import React, { useState, useTransition } from "react";
import { Building2, Users, Copy, Check, Power, Trash2, AlertCircle, CheckCircle2, Search, KeyRound, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleSchoolActive, deleteSchool } from "./actions";
import Link from "next/link";

interface School {
    id: string;
    name: string;
    address: string | null;
    invite_code: string;
    is_active: boolean;
    created_at: string;
    members: { count: number }[];
}

interface Props {
    schools: School[];
    message?: string;
    type?: string;
}

export default function SuperAdminClient({ schools, message, type }: Props) {
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.invite_code?.toLowerCase().includes(search.toLowerCase())
    );

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleToggle = (schoolId: string) => {
        startTransition(async () => {
            await toggleSchoolActive(schoolId);
        });
    };

    const handleDelete = (schoolId: string) => {
        if (confirmDelete === schoolId) {
            startTransition(async () => {
                await deleteSchool(schoolId);
                setConfirmDelete(null);
            });
        } else {
            setConfirmDelete(schoolId);
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    return (
        <div>
            {/* Message */}
            {message && (
                <div className={cn(
                    "mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500",
                    type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                )}>
                    {type === 'error' ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                    <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{message}</p>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Sekolah</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">{schools.length} sekolah terdaftar</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Cari nama atau kode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-72 h-11 pl-10 pr-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Schools List */}
                <div className="divide-y divide-slate-50">
                    {filteredSchools.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="mx-auto mb-4 text-slate-200" size={40} />
                            <p className="text-sm font-bold text-slate-400">Tidak ada sekolah ditemukan</p>
                        </div>
                    ) : (
                        filteredSchools.map((school) => {
                            const memberCount = school.members?.[0]?.count || 0;
                            return (
                                <div
                                    key={school.id}
                                    className={cn(
                                        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition-colors",
                                        !school.is_active && "bg-slate-50/50 opacity-60"
                                    )}
                                >
                                    {/* School Info */}
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                            school.is_active ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"
                                        )}>
                                            <Building2 size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-900 truncate">{school.name}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    {memberCount} anggota
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md",
                                                    school.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                                                )}>
                                                    {school.is_active ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Invite Code */}
                                        <button
                                            onClick={() => copyCode(school.invite_code, school.id)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                            title="Salin kode undangan"
                                        >
                                            <KeyRound size={14} />
                                            <span className="font-black uppercase tracking-wider text-slate-700">{school.invite_code}</span>
                                            {copiedId === school.id ? (
                                                <Check size={14} className="text-green-500" />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>

                                        {/* Detail */}
                                        <Link
                                            href={`/super-admin/${school.id}`}
                                            className="h-9 w-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                            title="Lihat detail"
                                        >
                                            <Eye size={16} />
                                        </Link>

                                        {/* Toggle Active */}
                                        <button
                                            onClick={() => handleToggle(school.id)}
                                            disabled={isPending}
                                            className={cn(
                                                "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                                                school.is_active
                                                    ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                                                    : "bg-green-50 text-green-500 hover:bg-green-100"
                                            )}
                                            title={school.is_active ? "Nonaktifkan" : "Aktifkan"}
                                        >
                                            <Power size={16} />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(school.id)}
                                            disabled={isPending}
                                            className={cn(
                                                "h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors",
                                                confirmDelete === school.id
                                                    ? "bg-red-500 text-white"
                                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                            )}
                                            title="Hapus sekolah"
                                        >
                                            <Trash2 size={14} />
                                            {confirmDelete === school.id && <span>Yakin?</span>}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
