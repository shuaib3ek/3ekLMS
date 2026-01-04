"use client";

import { useEffect, useState } from "react";
import { db, Assessment } from "@/lib/db";
import Link from "next/link";
import { ClipboardCheck, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function StudentAssessmentsPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);

    useEffect(() => {
        db.init();
        setAssessments(db.assessments.getAll());
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Assessments Center</h1>
                <p className="text-gray-500 mt-1">Validate your skills and earn certifications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map(asm => (
                    <div key={asm.id} className="group bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ClipboardCheck className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{asm.title}</h3>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{asm.durationMinutes} Minutes</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Pass Mark: {asm.passingScore}%</span>
                            </div>
                        </div>

                        <Link href={`/dashboard/assessments/${asm.id}`} className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all">
                            <span className="font-bold text-sm">Start Exam</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ))}

                {assessments.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                        <p className="text-gray-400 font-medium">No assessments assigned yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
