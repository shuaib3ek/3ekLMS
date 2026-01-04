"use client";

import { useAuth } from "@/context/AuthContext";
import { getCertificateAction } from "@/actions/assessment";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function CertificatePage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [certData, setCertData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const data = await getCertificateAction(user.id, params.id);
            if (!data) {
                alert("Certificate not found or criteria not met.");
                router.push("/dashboard/assessments");
                return;
            }
            setCertData(data);
            setLoading(false);
        };
        load();
    }, [user, params.id, router]);

    if (loading) return <div className="p-8">Loading Certificate...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32 print:p-0 print:max-w-none">
            <div className="flex justify-between items-center print:hidden">
                <Link href="/dashboard/assessments" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black">
                    <ArrowLeft className="w-4 h-4" /> Back to Assessments
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                    <Printer className="w-4 h-4" /> Print Certificate
                </button>
            </div>

            {/* Certificate Container */}
            <div className="bg-white p-12 md:p-20 rounded-xl shadow-lg text-center border-[10px] border-double border-gray-200 relative overflow-hidden print:shadow-none print:border-[10px]">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
                    <div className="w-[800px] h-[800px] rounded-full border-[100px] border-black"></div>
                </div>

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center mb-8">
                            <span className="text-white font-serif font-bold text-2xl">L</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight">
                            Certificate of Achievement
                        </h1>
                        <p className="text-lg text-gray-500 uppercase tracking-widest font-medium">This is hereby awarded to</p>
                    </div>

                    {/* Student Name */}
                    <div className="py-8 border-b border-gray-200 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-serif italic text-gray-900">
                            {certData.studentName}
                        </h2>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 max-w-2xl mx-auto">
                        <p className="text-gray-500 text-lg">For successfully completing the assessment</p>
                        <h3 className="text-3xl font-bold text-gray-900">{certData.quizTitle}</h3>
                    </div>

                    {/* Footer */}
                    <div className="pt-16 grid grid-cols-2 gap-20 max-w-3xl mx-auto">
                        <div className="text-center space-y-2">
                            <div className="border-b border-gray-900 pb-2">
                                <p className="font-serif italic text-xl">Learnlytica Team</p>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Instructor Signature</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="border-b border-gray-900 pb-2">
                                <p className="font-base text-xl">{certData.completedAt}</p>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Date Issued</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
