"use client";

import { useState, useEffect } from "react";
import { Batch } from "@prisma/client";
import { Users, Calendar, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { getInstructorBatches } from "@/actions/lms";
import { useAuth } from "@/context/AuthContext";

type BatchDTO = Omit<Batch, 'startDate' | 'endDate' | 'createdAt' | 'status'> & {
    startDate: string; endDate: string; createdAt: string;
    status?: string;
};

function getStatus(b: BatchDTO) {
    const now = new Date();
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    if (now < start) return "UPCOMING";
    if (now > end) return "COMPLETED";
    return "ACTIVE";
}

export default function BatchesPage() {
    const { user: currentUser } = useAuth();
    const [batches, setBatches] = useState<BatchDTO[]>([]);

    useEffect(() => {
        const load = async () => {
            if (currentUser?.id) {
                const data = await getInstructorBatches(currentUser.id);
                // Compute status on client
                const withStatus = data.map(b => ({
                    ...b,
                    status: getStatus(b as any)
                }));
                setBatches(withStatus);
            }
        };
        load();
    }, [currentUser?.id]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
                    <p className="text-gray-500 mt-1">Manage delivery schedules, attendance, and learner progress.</p>
                </div>
                <button className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all shadow-lg">
                    + Create New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <div key={batch.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                batch.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {batch.status}
                            </span>
                            <button className="text-gray-400 hover:text-black">
                                <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{batch.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">Program ID: {batch.programId}</p>

                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>Starts {batch.startDate}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>8 Weeks Duration</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>24 Learners Enrolled</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                            <Link href={`/instructor/batches/${batch.id}`} className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors">
                                Manage Delivery
                            </Link>
                            <Link href={`/instructor/batches/${batch.id}/attendance`} className="px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                Attendance
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
