"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db, Batch, Program } from "@/lib/db";
import {
    Calendar,
    Clock,
    MapPin,
    UserCheck,
    CheckCircle2,
    Circle,
    AlertTriangle,
    FlaskConical,
    ChevronDown,
    ChevronUp
} from "lucide-react";

export default function BatchDeliveryPage() {
    const params = useParams();
    const batchId = params.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [program, setProgram] = useState<Program | null>(null);
    const [activeDay, setActiveDay] = useState(0);

    // Mock Schedule based on Program Modules (One Module per Day for simplicity)
    const [schedule, setSchedule] = useState<any[]>([]);

    useEffect(() => {
        db.init();

        // Load Batch
        const fetchedBatch = db.batches.getAll().find(b => b.id === batchId);
        if (fetchedBatch) {
            setBatch(fetchedBatch);

            // Load Program
            // Assuming we can find the program mock. Using default mock for now if not in DB.
            // In real app, db.programs.getById(fetchedBatch.programId)

            // Mocking a Program structure for ILT
            const mockProgram = {
                id: fetchedBatch.programId,
                title: "Advanced AWS Networking",
                modules: [
                    { title: "Day 1: VPC Fundamentals & Addressing", type: "THEORY", status: "COMPLETED", date: "Feb 1, 2026" },
                    { title: "Day 2: Hybrid Connectivity (VPN/DX)", type: "LAB", status: "ACTIVE", date: "Feb 2, 2026", hasLab: true },
                    { title: "Day 3: Network Security & Transit Gateway", type: "THEORY", status: "UPCOMING", date: "Feb 3, 2026" },
                    { title: "Day 4: Load Balancing & Route53", type: "LAB", status: "UPCOMING", date: "Feb 4, 2026", hasLab: true },
                    { title: "Day 5: Capstone Project", type: "PROJECT", status: "UPCOMING", date: "Feb 5, 2026" }
                ]
            };
            setProgram(mockProgram as any);
            setSchedule(mockProgram.modules);

            // Set active day to the first ACTIVE or UPCOMING
            const activeIdx = mockProgram.modules.findIndex(m => m.status === 'ACTIVE' || m.status === 'UPCOMING');
            if (activeIdx !== -1) setActiveDay(activeIdx);
        }
    }, [batchId]);

    if (!batch || !program) return <div className="p-8">Loading...</div>;

    const currentSession = schedule[activeDay];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            {batch.status}
                        </span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            {batch.id}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
                    <p className="text-gray-500 mt-1">{program.title} • Instructor-Led Training</p>
                </div>

                <div className="flex gap-3">
                    <div className="text-right px-4 border-r border-gray-100">
                        <p className="text-2xl font-bold text-gray-900">24/25</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">Attendance</p>
                    </div>
                    <div className="text-right px-4">
                        <p className="text-2xl font-bold text-gray-900">Day {activeDay + 1}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">of 5 Days</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schedule / Timeline */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Course Schedule
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-1">
                        {schedule.map((day, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveDay(idx)}
                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${activeDay === idx ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                                        activeDay === idx ? 'bg-white text-black' : 'bg-gray-100'
                                    }`}>
                                    {day.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${activeDay === idx ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                                        {day.title}
                                    </p>
                                    <p className={`text-xs ${activeDay === idx ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {day.date} • {day.type}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Active Session Delivery */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Session Status Card */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSession.title}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" /> 09:00 AM - 05:00 PM
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" /> Room 404 (or Zoom)
                                    </span>
                                </div>
                            </div>
                            {currentSession.hasLab && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                    <FlaskConical className="w-4 h-4" /> Lab Session
                                </span>
                            )}
                        </div>

                        {/* Trainer Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" /> Attendance
                                </h4>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500">24 / 25 Marked</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="w-[96%] h-full bg-green-500 rounded-full" />
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-white border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                    Mark Attendance
                                </button>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4" /> Lab Environment
                                </h4>
                                {currentSession.hasLab ? (
                                    <>
                                        <p className="text-sm text-gray-500 mb-3">Glocumal Env: <strong>AWS-Sandbox-v2</strong></p>
                                        <button className="w-full py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                            Unlock Labs for Batch
                                        </button>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                        No labs scheduled for today.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lesson Plan / Topics */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-gray-900 mb-4">Lesson Grid</h4>
                            <div className="space-y-3">
                                {["Introduction & Safety Brief", "VPC Core Concepts", "Subnetting Workshop", "Break (1h)", "Route Tables & Gateways"].map((topic, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${i < 2 ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                                            }`}>
                                            {i < 2 && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={`text-sm ${i < 2 ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                                            {topic}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
