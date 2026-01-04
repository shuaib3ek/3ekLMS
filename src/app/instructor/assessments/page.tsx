"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, ClipboardCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getInstructorQuizzesAction } from "@/actions/assessment";

export default function AssessmentsPage() {
    const { user } = useAuth();
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const data = await getInstructorQuizzesAction(user.id);
            setAssessments(data);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div className="p-8">Loading Assessments...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
                    <p className="text-gray-500 mt-1">Create quizzes, certification exams, and skill checks.</p>
                </div>
                <Link
                    href="/instructor/assessments/create"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" /> Create Assessment
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.length === 0 && (
                    <div className="col-span-3 text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500">No assessments created yet.</p>
                    </div>
                )}
                {assessments.map(asm => (
                    <div key={asm.id} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">
                                {asm.batch.name}
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{asm.title}</h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" />
                                <span>{asm._count.questions} Qs</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" />
                                <span>{asm._count.submissions} Subs</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            <span className="flex-1 text-center py-2 text-sm font-bold text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed">
                                Edit
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
