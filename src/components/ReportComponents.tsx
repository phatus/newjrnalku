"use client";

import React from "react";

export function PrintButton({ label }: { label: string }) {
    return (
        <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors"
        >
            Cetak / Print
        </button>
    );
}

export function BackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
        >
            Kembali
        </button>
    );
}

export function ReportHeader({ schoolName, schoolAddress }: { schoolName?: string; schoolAddress?: string }) {
    return (
        <div className="text-center mb-6 pb-4 border-b-2 border-slate-900">
            <p className="text-sm font-bold uppercase tracking-wide">{schoolName || 'Madrasah'}</p>
            <p className="text-xs text-slate-600">{schoolAddress || ''}</p>
            <div className="mt-3 h-px w-full bg-slate-300" />
        </div>
    );
}

export function ReportFooter({ headmasterName, headmasterNip, profileName, profileNip, schoolName, schoolAddress, schoolCity }: {
    headmasterName?: string;
    headmasterNip?: string;
    profileName?: string;
    profileNip?: string;
    schoolName?: string;
    schoolAddress?: string;
    schoolCity?: string;
}) {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Prefer schoolCity, fallback to last word of address (legacy), fallback to Pacitan
    let location = schoolCity;
    if (!location && schoolAddress) {
        const addressParts = schoolAddress.trim().split(/\s+/);
        location = addressParts[addressParts.length - 1];
    }
    if (!location) location = 'Pacitan';

    return (
        <div className="mt-12 print:mt-8 space-y-10 signature-block border-t border-slate-100 pt-8 text-sm">
            <div className="grid grid-cols-2 gap-8">
                {/* Left: Employee Signature */}
                <div className="flex flex-col items-center">
                    <div className="space-y-16 print:space-y-12">
                        <div className="space-y-1 text-center">
                            <p className="font-bold tracking-wide">Yang membuat laporan,</p>
                            <p className="text-[11px] font-medium text-slate-600">Pegawai</p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="font-black underline min-w-48">{profileName || '................................'}</p>
                            <p className="font-bold text-[10px]">NIP. {profileNip || '................................'}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Chief Approver */}
                <div className="flex flex-col items-center">
                    <div className="space-y-16 print:space-y-12">
                        <div className="text-center space-y-1">
                            <p className="font-bold">{location}, {today}</p>
                            <p className="font-bold tracking-wide">Mengetahui,</p>
                            <p className="text-[11px] font-medium text-slate-600">Kepala {schoolName || 'Sekolah'}</p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="font-black underline min-w-48">{headmasterName || '................................'}</p>
                            <p className="font-bold text-[10px]">NIP. {headmasterNip || '................................'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
