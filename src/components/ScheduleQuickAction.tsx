'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react'
import { convertScheduleToActivity } from '@/app/activities/schedule/actions'
import { cn } from '@/lib/utils'

interface ScheduleItem {
    id: string
    topic: string
    day_of_week: number
    teaching_hours?: string
    is_confirmed_today?: boolean
    report_categories?: { name: string }
    schedule_class_rooms?: { class_rooms: { name: string } }[]
}

export default function ScheduleQuickAction({ initialSchedules, selectedDate }: { initialSchedules: any[], selectedDate: string }) {
    const [todaySchedules, setTodaySchedules] = useState<ScheduleItem[]>([])
    const [loading, setLoading] = useState<string | null>(null)
    const [completed, setCompleted] = useState<string[]>([])

    useEffect(() => {
        // Parse the selectedDate to get the day of the week (0-6)
        const dateObj = new Date(selectedDate)
        const dayOfWeek = dateObj.getDay()
        
        const filtered = initialSchedules.filter(s => s.day_of_week === dayOfWeek)
        setTodaySchedules(filtered)

        // Mark as completed if already confirmed on server
        const alreadyConfirmed = filtered.filter(s => s.is_confirmed_today).map(s => s.id)
        setCompleted(alreadyConfirmed)
    }, [initialSchedules, selectedDate])

    const handleConfirm = async (id: string) => {
        setLoading(id)
        try {
            const result = await convertScheduleToActivity(id, selectedDate) as any

            if (result && result.success === false) {
                alert(result.error || 'Terjadi kesalahan.')
                if (result.error?.includes('sudah dibuat')) {
                    setCompleted(prev => [...prev, id])
                }
            } else {
                setCompleted(prev => [...prev, id])
            }
        } catch (error) {
            console.error('Failed to confirm schedule:', error)
            alert('Gagal mencatat kegiatan. Silakan coba lagi.')
        } finally {
            setLoading(null)
        }
    }

    const isToday = selectedDate === new Date().toISOString().split('T')[0]

    if (todaySchedules.length === 0) {
        if (initialSchedules.length === 0) {
            return (
                <section className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 border-dashed text-center space-y-3">
                    <Calendar className="mx-auto text-amber-500 opacity-50" size={32} />
                    <div>
                        <h3 className="text-sm font-black text-amber-900 uppercase">Otomatisasi Belum Diatur</h3>
                        <p className="text-[11px] font-bold text-amber-600/70 uppercase tracking-wider">Atur jadwal mingguan Anda agar pengisian jurnal harian jadi lebih cepat!</p>
                    </div>
                    <a href="/activities/schedule" className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
                        MULAI ATUR JADWAL <ArrowRight size={14} />
                    </a>
                </section>
            )
        }
        return null
    }

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="text-amber-500" size={20} />
                    {isToday ? 'Jadwal Anda Hari Ini' : `Jadwal: ${new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long' })}
                </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {todaySchedules.map((item) => {
                    const isDone = completed.includes(item.id)
                    const classNames = item.schedule_class_rooms?.map((p: any) => p.class_rooms?.name).filter(Boolean).join(', ');

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "group relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-500",
                                isDone
                                    ? "bg-green-50 border-green-100 opacity-75 shadow-sm"
                                    : "bg-white border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    isDone ? "bg-green-500 text-white shadow-lg shadow-green-100" : "bg-slate-50 text-slate-400 group-hover:bg-amber-500 group-hover:text-white"
                                )}>
                                    {isDone ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                </div>
                                {!isDone && (
                                    <button
                                        onClick={() => handleConfirm(item.id)}
                                        disabled={loading === item.id}
                                        className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {loading === item.id ? "PROSES..." : "KONFIRMASI SELESAI"}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className={cn(
                                    "font-black tracking-tight uppercase truncate transition-colors",
                                    isDone ? "text-green-700" : "text-slate-900 group-hover:text-amber-600"
                                )}>
                                    {item.topic}
                                </h3>
                                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className={cn(isDone ? "text-green-600/60" : "text-slate-400")}>{item.report_categories?.name}</span>
                                    {item.teaching_hours && <span className={cn(isDone ? "text-green-600/60" : "text-slate-400")}>• {item.teaching_hours} JP</span>}
                                    {classNames && (
                                        <span className={cn(isDone ? "text-green-600" : "text-amber-500")}>• KLS: {classNames}</span>
                                    )}
                                </div>
                            </div>

                            {isDone && (
                                <div className="absolute top-2 right-2 rotate-12">
                                    <span className="text-[10px] font-black text-green-600 border-2 border-green-600 rounded px-2 py-0.5 uppercase opacity-30">Tercatat</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
