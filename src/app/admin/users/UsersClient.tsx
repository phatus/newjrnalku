"use client";

import React, { useState } from "react";
import { ChevronLeft, Trash2, Shield, User, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { updateUserRole, deleteUser } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function handleRoleChange(id: string, newRole: string) {
        setLoadingId(id);
        try {
            await updateUserRole(id, newRole);
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingId(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus pengguna ini? (Data profil akan hilang)")) return;
        setLoadingId(id);
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/admin"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Manajemen Akses</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Pengguna</h1>
                        <p className="text-slate-500 mt-1 font-medium">Kelola hak akses dan peran seluruh pegawai.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 mt-10">
                <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Pegawai</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">NIP / Jabatan</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Peran / Role</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", user.role === 'admin' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600")}>
                                                {user.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-none">{user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{user.unit_kerja || 'Unit Kerja Belum Set'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold">
                                        <p className="text-slate-700">{user.nip || 'NIP -'}</p>
                                        <p className="text-xs text-slate-400 font-medium">{user.jabatan || 'Jabatan -'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <select
                                            value={user.role}
                                            disabled={loadingId === user.id}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={cn(
                                                "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-2",
                                                user.role === 'admin' ? "bg-amber-50 text-amber-700 focus:ring-amber-500" : "bg-slate-100 text-slate-600 focus:ring-slate-400"
                                            )}
                                        >
                                            <option value="user">Pegawai (User)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={loadingId === user.id}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                        >
                                            {loadingId === user.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
