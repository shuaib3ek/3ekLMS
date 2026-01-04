"use client";

import { useAuth } from "@/context/AuthContext";
import { getQuizAction, submitQuizAction } from "@/actions/assessment";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function TakeQuizPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Answers state: { questionId: optionId }
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        const load = async () => {
            const data = await getQuizAction(params.id);
            if (!data) {
                alert("Quiz not found");
                router.push("/dashboard/assessments");
                return;
            }
            setQuiz(data);
            setLoading(false);
        };
        load();
    }, [params.id, router]);

    const handleSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        const unanswered = quiz.questions.length - Object.keys(answers).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) return;
        }

        setSubmitting(true);
        try {
            const res = await submitQuizAction(user.id, quiz.id, answers);
            if (res.success) {
                alert(`Quiz Submitted! You scored ${res.score}/${res.totalPoints} (${res.passed ? "PASSED" : "FAILED"})`);
                router.push("/dashboard/assessments");
            } else {
                alert("Submission failed: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error submitting quiz");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading Quiz...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
            <Link href="/dashboard/assessments" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4">
                <ArrowLeft className="w-4 h-4" /> Exit Quiz
            </Link>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 45 Mins</span>
                        <span>•</span>
                        <span>{quiz.questions.length} Questions</span>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {submitting ? "Submitting..." : "Submit Quiz"} <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {quiz.questions.map((q: any, idx: number) => (
                    <div key={q.id} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Question {idx + 1}</span>
                            <span className="text-sm font-medium text-gray-500">{q.points} pts</span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-6">{q.text}</h3>

                        <div className="space-y-3">
                            {q.options.map((opt: any) => {
                                const isSelected = answers[q.id] === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleSelect(q.id, opt.id)}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                                            isSelected
                                                ? "border-black bg-gray-50 text-black"
                                                : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                            isSelected ? "border-black" : "border-gray-300"
                                        )}>
                                            {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                        </div>
                                        <span className="font-medium">{opt.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
