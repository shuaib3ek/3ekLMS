"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, Assessment, Question } from "@/lib/db";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";

export default function CreateAssessmentPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(60);
    const [passingScore, setPassingScore] = useState(70);
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: crypto.randomUUID(),
            text: "What is the primary function of a VPC?",
            type: "MCQ",
            points: 10,
            options: ["To start virtual machines", "To isolate network traffic", "To store S3 objects", "To manage user identities"],
            correctOption: 1
        }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: crypto.randomUUID(),
            text: "",
            type: "MCQ",
            points: 10,
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctOption: 0
        }]);
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const updateOption = (qId: string, optIndex: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                const newOpts = [...q.options];
                newOpts[optIndex] = text;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSave = () => {
        if (!title.trim()) return alert("Title is required");

        const newAssessment: Assessment = {
            id: `asm_${Date.now()}`,
            title,
            orgId: "org_default",
            durationMinutes: duration,
            passingScore,
            questions
        };

        db.assessments.create(newAssessment);
        router.push("/instructor/assessments");
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-20 bg-gray-50/80 backdrop-blur-sm z-30 py-4 -my-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
                        <p className="text-gray-500 text-sm">Define questions, scoring, and time limits.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                >
                    <Save className="w-4 h-4" /> Save & Publish
                </button>
            </div>

            {/* Config Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Assessment Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect - Mock Exam 1"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Minutes)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={e => setDuration(parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Passing Score (%)</label>
                        <input
                            type="number"
                            value={passingScore}
                            onChange={e => setPassingScore(parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Questions ({questions.length})</h2>
                    <button
                        onClick={addQuestion}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                </div>

                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500">
                                    {idx + 1}
                                </span>
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                                    placeholder="Enter question text here..."
                                    className="text-lg font-medium text-gray-900 border-none focus:ring-0 placeholder-gray-300 w-[600px]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Points:</span>
                                <input
                                    type="number"
                                    value={q.points}
                                    onChange={e => updateQuestion(q.id, 'points', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 bg-gray-50 rounded border border-gray-200 text-sm font-bold text-center"
                                />
                                <button onClick={() => removeQuestion(q.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="pl-11 space-y-3">
                            {q.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-${q.id}`}
                                        checked={q.correctOption === i}
                                        onChange={() => updateQuestion(q.id, 'correctOption', i)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => updateOption(q.id, i, e.target.value)}
                                        className={`flex-1 px-4 py-2 rounded-lg border text-sm transition-all ${q.correctOption === i
                                                ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-medium'
                                                : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
