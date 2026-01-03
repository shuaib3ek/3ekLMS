"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
    const [title, setTitle] = useState("");
    const router = useRouter();

    const handleContinue = () => {
        if (!title) return;

        // Generate unique ID by appending timestamp
        const courseId = (title.toLowerCase().replace(/\s+/g, '-') || 'new-course') + '-' + Date.now();
        const newCourse = {
            id: courseId,
            title: title,
            status: "Draft",
            students: 0,
            rating: 0,
            lastUpdated: "Just now",
            thumbnail: "bg-gray-100"
        };

        const existing = localStorage.getItem("instructor_courses");
        const courses = existing ? JSON.parse(existing) : [];
        courses.push(newCourse);
        localStorage.setItem("instructor_courses", JSON.stringify(courses));

        router.push(`/instructor/course/${courseId}/edit`);
    };

    return (
        <div className="max-w-3xl mx-auto py-20 px-6">
            <Link href="/instructor" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <div className="space-y-2 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    Step 1 of 3
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Name your course</h1>
                <p className="text-xl text-gray-500">
                    What would you like to call this course? Don't worry, you can change this later.
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="courseTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Advanced Microservices with Go"
                            className="w-full px-5 py-4 text-xl bg-white border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            autoFocus
                        />
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors ${title.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                            {title.length}/60
                        </div>
                    </div>
                </div>

                {/* AI Suggestion Box (Mock) */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 p-5 rounded-xl flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-purple-600">
                        <Lightbulb className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">Need inspiration?</h3>
                        <p className="text-gray-600 text-sm mb-3">Try titles that promise a specific outcome, like "Mastering Kubernetes" or "Zero to Hero in React".</p>
                        <button className="text-xs font-bold text-purple-700 hover:underline">Generate AI Suggestions</button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
                    <Link href="/instructor" className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Cancel
                    </Link>
                    <button
                        onClick={handleContinue}
                        disabled={!title}
                        className={`px-8 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all flex items-center gap-2 ${!title ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Continue <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
