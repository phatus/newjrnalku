import React from "react";
import { getUserCategories } from "../actions";
import CategoriesClient from "./CategoriesClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getCategories } from "@/app/activities/actions";

export default async function UserCategoriesPage() {
    // getCategories() returns both global + user categories
    const allCategories = await getCategories();
    // getUserCategories() returns only user-created categories for editing/deletion
    const userOnlyCategories = await getUserCategories();

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kategori Laporan</h1>
                    <p className="text-slate-500 mt-1 font-medium">Kelola RHK dan kategori KBM yang Anda buat sendiri.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 mt-10">
                <CategoriesClient
                    allCategories={allCategories}
                    userOnlyCategories={userOnlyCategories}
                />
            </div>
        </div>
    );
}
