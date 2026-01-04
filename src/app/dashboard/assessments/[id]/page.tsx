"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, Assessment, AssessmentAttempt } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, X } from "lucide-react";

export default function TakeAssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const assessmentId = params.id as string;

    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> selectedOptionIndex
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        db.init();
        const asm = db.assessments.getById(assessmentId);
        if (asm) {
            setAssessment(asm);
            setTimeLeft(asm.durationMinutes * 60);
        }
    }, [assessmentId]);

    // Timer logic
    useEffect(() => {
        if (!submitted && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !submitted && assessment) {
            handleSubmit();
        }
    }, [timeLeft, submitted, assessment]);

    const handleSelectOption = (questionId: string, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    };

    const handleSubmit = () => {
        if (!assessment || !user) return;

        // Calculate Score
        let rawScore = 0;
        let totalPoints = 0;

        assessment.questions.forEach(q => {
            totalPoints += q.points;
            if (answers[q.id] === q.correctOption) {
                rawScore += q.points;
            }
        });

        const percentage = Math.round((rawScore / totalPoints) * 100);
        setScore(percentage);
        setSubmitted(true);

        // Save Attempt
        const attempt: AssessmentAttempt = {
            id: crypto.randomUUID(),
            assessmentId: assessment.id,
            userId: user.id,
            startedAt: new Date().toISOString(), // Approximation
            completedAt: new Date().toISOString(),
            score: percentage,
            status: 'COMPLETED'
        };
        db.attempts.create(attempt);
    };

    if (!assessment) return <div className="p-8">Loading Assessment...</div>;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (submitted) {
        const passed = score >= assessment.passingScore;
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-8">
                <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{passed ? 'Congratulations!' : 'Assessment Failed'}</h2>
                        <p className="text-gray-500">You scored <strong>{score}%</strong>. Passing score is {assessment.passingScore}%.</p>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard/assessments')}
                        className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
                    >
                        Back to Assessments
                    </button>

                    {!passed && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                        >
                            Retake Exam
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const question = assessment.questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === assessment.questions.length - 1;

    return (
        <div className="max-w-4xl mx-auto py-12 px-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm py-4 z-20">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
                    <p className="text-sm text-gray-500">Question {currentQuestionIdx + 1} of {assessment.questions.length}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-mono font-bold flex items-center gap-2 ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                    <Clock className="w-4 h-4" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                    {question.text}
                </h2>

                <div className="space-y-4 flex-1">
                    {question.options?.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectOption(question.id, idx)}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${answers[question.id] === idx
                                    ? 'border-black bg-black text-white shadow-lg'
                                    : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white text-gray-700'
                                }`}
                        >
                            <span className="font-medium text-lg">{opt}</span>
                            {answers[question.id] === idx && <CheckCircle2 className="w-6 h-6" />}
                        </button>
                    ))}
                </div>

                {/* Footer Navigation */}
                <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
                        disabled={currentQuestionIdx === 0}
                        className="px-6 py-3 font-bold text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                    >
                        Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Submit Assessment
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIdx(p => p + 1)}
                            className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            Next Question <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / assessment.questions.length) * 100}%` }}
                />
            </div>
        </div>
    );
}
