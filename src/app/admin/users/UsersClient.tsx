"use client";

import React, { useState } from "react";
import { ChevronLeft, Trash2, Shield, User as UserIcon, Loader2, Mail, Key, X, Save } from "lucide-react";
import Link from "next/link";
import { updateUserRole, deleteUser, updateUserPassword } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import type { Profile } from "@/types";

export default function UsersClient({ initialUsers }: { initialUsers: Profile[] }) {
    const [users, setUsers] = useState<Profile[]>((initialUsers || []) as Profile[]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");

    async function handleRoleChange(id: string, newRole: 'user' | 'admin') {
        setLoadingId(id);
        try {
            await updateUserRole(id, newRole);
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            toast.success('Peran pengguna berhasil diperbarui');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingId(null);
        }
    }

    async function handlePasswordUpdate() {
        if (!editingPasswordId || !newPassword) return;
        if (newPassword.length < 6) {
            toast.error("Password minimal 6 karakter");
            return;
        }

        setLoadingId(editingPasswordId);
        try {
            await updateUserPassword(editingPasswordId, newPassword);
            toast.success("Password berhasil diperbarui");
            setEditingPasswordId(null);
            setNewPassword("");
        } catch (err: any) {
            toast.error(err.message);
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
            toast.success('Pengguna berhasil dihapus');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-10 relative">
            {/* Modal Password Reset */}
            {editingPasswordId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Key size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight">Atur Ulang Password</h3>
                            </div>
                            <button
                                onClick={() => setEditingPasswordId(null)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password Baru</label>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Masukkan password baru..."
                                    className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 ml-1">Minimal 6 karakter. Pastikan pegawai mencatat password baru ini.</p>
                            </div>

                            <button
                                onClick={handlePasswordUpdate}
                                disabled={loadingId === editingPasswordId || !newPassword}
                                className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 mt-4 group"
                            >
                                {loadingId === editingPasswordId ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                                SIMPAN PASSWORD BARU
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                                {user.role === 'admin' ? <Shield size={24} /> : <UserIcon size={24} />}
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
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                                            className={cn(
                                                "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-2",
                                                user.role === 'admin' ? "bg-amber-50 text-amber-700 focus:ring-amber-500" : "bg-slate-100 text-slate-600 focus:ring-slate-400"
                                            )}
                                        >
                                            <option value="user">Pegawai (User)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setEditingPasswordId(user.id)}
                                            disabled={loadingId === user.id}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                            title="Atur Ulang Password"
                                        >
                                            <Key size={16} />
                                        </button>
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
