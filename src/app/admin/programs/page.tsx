"use client";

import { useEffect, useState } from "react";
import { Program } from "@prisma/client";
import { Search, Plus, MoreHorizontal, Layers, BookOpen } from "lucide-react";
import { getAllPrograms } from "@/actions/lms";
import { useAuth } from "@/context/AuthContext";

type ProgramWithCounts = Program & {
    _count: {
        batches: number;
    }
};

export default function AdminProgramsPage() {
    const { user: currentUser } = useAuth();
    const [programs, setPrograms] = useState<ProgramWithCounts[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            if (currentUser?.orgId) {
                try {
                    const data = await getAllPrograms(currentUser.orgId);
                    setPrograms(data as ProgramWithCounts[]);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPrograms();
    }, [currentUser?.orgId]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Program Catalog</h1>
                    <p className="text-gray-500 mt-1">Manage educational programs and curricula.</p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg">
                    <Plus className="w-4 h-4" /> Create Program
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Structure</th>
                            <th className="px-6 py-4">Batches</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && programs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : programs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No programs found.</td></tr>
                        ) : (
                            programs.map((program) => (
                                <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{program.title}</p>
                                                <p className="text-xs text-gray-500">ID: {program.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                            <span>Curriculum</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold">
                                            {program._count?.batches || 0} Batches
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(program.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
