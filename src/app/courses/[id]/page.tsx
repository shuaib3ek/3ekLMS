"use client";

import { use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    PlayCircle,
    CheckCircle2,
    Clock,
    BarChart,
    Users,
    Share2,
    Terminal
} from "lucide-react";
import { courses } from "@/lib/mockData";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CourseDetailPage(props: PageProps) {
    // Unwrap params using React.use for Next.js 15
    const params = use(props.params);
    const course = courses.find((c) => c.id === params.id);

    if (!course) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-6 h-20 flex items-center justify-between">
                <Link href="/courses" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Library
                </Link>
                <div className="flex gap-3">
                    <button className="p-2 text-gray-400 hover:text-black transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="px-5 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all">
                        Start Learning
                    </button>
                </div>
            </nav>

            {/* Hero Header */}
            <header className="pt-40 pb-20 px-6 bg-gray-50/50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                                {course.category}
                            </span>
                            {course.hasLab && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    <Terminal className="w-3 h-3" /> Hands-on Lab
                                </span>
                            )}
                        </div>

                        <h1 className="text-5xl font-bold text-gray-900 leading-[1.1]">{course.title}</h1>
                        <p className="text-xl text-gray-600 leading-relaxed">{course.description}</p>

                        <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" /> {course.duration}
                            </div>
                            <div className="flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-gray-400" /> {course.level}
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" /> {course.students.toLocaleString()} Enrolled
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{course.instructor.name}</p>
                                    <p className="text-xs text-gray-500">{course.instructor.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image / Video Placeholder */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />
                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
                            <img src={course.image} className="w-full object-cover" alt="Course Preview" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div className="w-20 h-20 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl cursor-pointer group-hover:scale-110 transition-transform duration-300">
                                    <PlayCircle className="w-8 h-8 text-black ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Curriculum Content */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">What you'll learn</h2>

                <div className="grid gap-6">
                    {course.curriculum.map((module, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-default">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 text-sm font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                {module.title}
                            </h3>

                            <div className="space-y-4 pl-11">
                                {module.items.map((item, j) => (
                                    <div key={j} className="flex items-center gap-3 text-gray-600 group">
                                        <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                            <PlayCircle className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

        </div>
    );
}
