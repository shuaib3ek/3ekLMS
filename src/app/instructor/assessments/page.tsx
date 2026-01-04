"use client";

import { useState, useEffect } from "react";
import { db, Assessment } from "@/lib/db";
import { Plus, Search, MoreVertical, ClipboardCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AssessmentsPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);

    useEffect(() => {
        db.init();

        // Load Assessments
        const allAssessments = db.assessments.getAll();

        // Mock seed for demo
        if (allAssessments.length === 0) {
            const demoAssessment: Assessment = {
                id: "asm_1",
                title: "AWS Networking Baseline",
                orgId: "org_default",
                durationMinutes: 45,
                passingScore: 70,
                questions: [] // Empty for summary view
            };
            db.assessments.create(demoAssessment);
            setAssessments([demoAssessment]);
        } else {
            setAssessments(allAssessments);
        }
    }, []);

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

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-xl border border-gray-200 shadow-sm max-w-xl">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map(asm => (
                    <div key={asm.id} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <button className="text-gray-400 hover:text-black">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{asm.title}</h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{asm.durationMinutes} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" />
                                <span>Pass: {asm.passingScore}%</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            <Link href={`/instructor/assessments/${asm.id}`} className="flex-1 text-center py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                Edit
                            </Link>
                            <Link href={`/instructor/assessments/${asm.id}/preview`} className="flex-1 text-center py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                Preview
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
