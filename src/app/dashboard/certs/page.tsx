"use client";

import { useEffect, useState } from "react";
import { db, AssessmentAttempt, User } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Download, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";

export default function CertificationsPage() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        db.init();

        // Find completed attempts with passing score
        const attempts = db.attempts.getByUser(user.id).filter(a => a.status === 'COMPLETED');
        const assessments = db.assessments.getAll();

        const earned = attempts.map(att => {
            const asm = assessments.find(a => a.id === att.assessmentId);
            if (asm && att.score && att.score >= asm.passingScore) {
                return {
                    id: att.id,
                    title: asm.title,
                    date: new Date(att.completedAt || "").toLocaleDateString(),
                    score: att.score
                };
            }
            return null;
        }).filter(Boolean);

        setCertificates(earned);
    }, [user]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Certifications</h1>
                <p className="text-gray-500 mt-1">Verified credentials and earned badges.</p>
            </div>

            {certificates.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Certificates Yet</h3>
                    <p className="text-gray-500 mb-6">Complete assessments to earn your first certificate.</p>
                    <Link href="/dashboard/assessments" className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                        Browse Assessments
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 flex flex-col justify-between hover:border-blue-100 hover:shadow-lg transition-all">
                            <div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{cert.title}</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Verified Credential</p>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Earned on {cert.date}</span>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
