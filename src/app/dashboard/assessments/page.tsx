"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { ClipboardCheck, Play, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getStudentQuizzesAction } from "@/actions/assessment";

export default function AssessmentsPage() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const data = await getStudentQuizzesAction(user.id);
            setQuizzes(data);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
                <p className="text-gray-500 mt-1">Verify your skills and earn badges.</p>
            </div>

            {quizzes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center py-20">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ClipboardCheck className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Quizzes Available</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Your instructors haven't posted any quizzes for your current batches yet. Check back later!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">{quiz.batchName}</span>
                                {quiz.status === "PENDING" && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Pending</span>}
                                {quiz.status === "PASSED" && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passed</span>}
                                {quiz.status === "FAILED" && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>}
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 mb-2">{quiz.title}</h3>
                            <p className="text-sm text-gray-500 mb-6">{quiz.questionCount} Questions</p>

                            <div className="mt-auto flex gap-2">
                                {quiz.status === "PENDING" && (
                                    <Link
                                        href={`/dashboard/assessments/${quiz.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Start Quiz <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}

                                {quiz.status === "FAILED" && (
                                    <span className="w-full block py-3 bg-gray-50 text-red-500 rounded-xl font-bold text-center">
                                        Score: {quiz.score} Pts (Failed)
                                    </span>
                                )}

                                {quiz.status === "PASSED" && (
                                    <>
                                        <div className="flex-1 py-3 bg-gray-50 text-green-600 rounded-xl font-bold text-center">
                                            {quiz.score} Pts
                                        </div>
                                        <Link
                                            href={`/dashboard/certificates/${quiz.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            Certificate
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
