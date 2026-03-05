import React from "react";
import { getUserClassRooms } from "../actions";
import ClassesClient from "./ClassesClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getClassRooms } from "@/app/activities/actions";

export default async function UserClassesPage() {
    const allClassRooms = await getClassRooms();
    const userOnlyClassRooms = await getUserClassRooms();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
            <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/master-data"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Data Master</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Kelas</h1>
                    <p className="text-slate-500 mt-1 font-medium">Kelola daftar kelas siswa yang Anda ajar.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 mt-10">
                <ClassesClient
                    allClassRooms={allClassRooms}
                    userOnlyClassRooms={userOnlyClassRooms}
                />
            </div>
        </div>
    );
}
