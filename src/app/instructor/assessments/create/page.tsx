"use client";

import { useAuth } from "@/context/AuthContext";
import { getInstructorBatches } from "@/actions/lms";
import { createQuizAction, CreateQuizInput } from "@/actions/assessment";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateAssessmentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");

    const [questions, setQuestions] = useState<any[]>([
        {
            text: "",
            type: "MULTIPLE_CHOICE",
            points: 10,
            options: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ]
        }
    ]);

    useEffect(() => {
        if (!user) return;
        const loadBatches = async () => {
            const data = await getInstructorBatches(user.id);
            setBatches(data);
            if (data.length > 0) setSelectedBatch(data[0].id);
        };
        loadBatches();
    }, [user]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "",
                type: "MULTIPLE_CHOICE",
                points: 10,
                options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
            }
        ]);
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const newQs = [...questions];
        newQs[idx] = { ...newQs[idx], [field]: value };
        setQuestions(newQs);
    };

    const updateOption = (qIdx: number, oIdx: number, field: string, value: any) => {
        const newQs = [...questions];
        const newOpts = [...newQs[qIdx].options];
        newOpts[oIdx] = { ...newOpts[oIdx], [field]: value };
        newQs[qIdx].options = newOpts;
        setQuestions(newQs);
    };

    const addOption = (qIdx: number) => {
        const newQs = [...questions];
        newQs[qIdx].options.push({ text: "", isCorrect: false });
        setQuestions(newQs);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (!title || !selectedBatch) return alert("Title and Batch are required");
        setLoading(true);

        try {
            const res = await createQuizAction({
                title,
                description,
                batchId: selectedBatch,
                questions: questions.map(q => ({
                    text: q.text,
                    type: q.type as any, // Cast to server type
                    points: Number(q.points),
                    options: q.options
                }))
            });

            if (res.success) {
                alert("Quiz Created!");
                router.push("/instructor/assessments");
            } else {
                alert("Error: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
            <Link href="/instructor/assessments" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Assessments
            </Link>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Publish Quiz"}
                </button>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Quiz Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all"
                            placeholder="e.g. React Fundamentals"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Assign to Batch</label>
                        <select
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all"
                        >
                            <option value="" disabled>Select a batch</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all h-24 resize-none"
                        placeholder="Instructions for students..."
                    />
                </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Questions</h2>
                {questions.map((q, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative group">
                        <button
                            onClick={() => removeQuestion(idx)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="space-y-4 pr-12">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Question {idx + 1}</label>
                                    <input
                                        value={q.text}
                                        onChange={e => updateQuestion(idx, "text", e.target.value)}
                                        className="w-full p-3 font-medium bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                                        placeholder="Enter question text..."
                                    />
                                </div>
                                <div className="w-48 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Points</label>
                                    <input
                                        type="number"
                                        value={q.points}
                                        onChange={e => updateQuestion(idx, "points", e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Options</label>
                                {q.options.map((opt: any, oIdx: number) => (
                                    <div key={oIdx} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`q-${idx}-correct`}
                                            checked={opt.isCorrect}
                                            onChange={() => {
                                                // Uncheck others
                                                const newOpts = q.options.map((o: any, i: number) => ({ ...o, isCorrect: i === oIdx }));
                                                updateQuestion(idx, "options", newOpts);
                                            }}
                                            className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                                        />
                                        <input
                                            value={opt.text}
                                            onChange={e => updateOption(idx, oIdx, "text", e.target.value)}
                                            className={`flex-1 p-2 bg-white border-b border-gray-200 focus:border-black outline-none transition-colors ${opt.isCorrect ? "font-bold text-green-700" : ""}`}
                                            placeholder={`Option ${oIdx + 1}`}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => addOption(idx)}
                                    className="text-xs font-bold text-blue-600 hover:underline mt-2"
                                >
                                    + Add Option
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-black hover:text-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Question
                </button>
            </div>
        </div>
    );
}
