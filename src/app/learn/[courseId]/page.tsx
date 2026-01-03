"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, PlayCircle, Terminal as TerminalIcon, CheckCircle2, FileText, HelpCircle, Check, X } from "lucide-react";
import { Terminal } from "@/components/ui/Terminal";
import { cn } from "@/lib/utils";
import { courses as mockCourses } from "@/lib/mockData";
import { notFound } from "next/navigation";

// --- Types ---
interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'article' | 'quiz';
    duration: string;
    content?: string;
}

// --- Components ---

function VideoPlayer({ title, content }: { title: string, content?: string }) {
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes("youtube.com/watch?v=")) {
            return url.replace("watch?v=", "embed/");
        }
        if (url.includes("youtu.be/")) {
            return url.replace("youtu.be/", "youtube.com/embed/");
        }
        return null;
    };

    const embedUrl = content ? getEmbedUrl(content) : null;

    if (embedUrl) {
        return (
            <div className="w-full h-full bg-black">
                <iframe
                    src={embedUrl}
                    title={title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black relative group overflow-hidden flex flex-col">
            <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <PlayCircle className="w-10 h-10 text-white fill-current" />
                    </div>
                </div>
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-1 bg-gray-600 rounded-full mb-4 cursor-pointer overflow-hidden">
                        <div className="w-1/3 h-full bg-blue-500" />
                    </div>
                    <div className="flex justify-between text-white text-sm font-medium">
                        <span>04:20 / 12:45</span>
                        <span>1080p</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArticleView({ title, content }: { title: string, content?: string }) {
    return (
        <div className="w-full h-full bg-white text-black p-12 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 pb-8 border-b border-gray-100">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Article</span>
                    <h1 className="text-4xl font-bold mt-2 mb-4">{title}</h1>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <span>Updated yesterday</span>
                        <span>•</span>
                        <span>12 min read</span>
                    </div>
                </div>
                <div className="prose prose-lg prose-gray max-w-none">
                    <p className="lead text-xl text-gray-600 mb-8">
                        {content || "This article explores the fundamental concepts required to understand this module. We will cover key terminology, best practices, and real-world examples."}
                    </p>
                    <h3>Introduction</h3>
                    <p>
                        In software engineering, understanding the underlying principles is often more valuable than memorizing syntax. This lesson focuses on the architectural decisions that shape modern applications.
                    </p>
                    <h3>Key Concepts</h3>
                    <ul>
                        <li><strong className="text-black">Scalability:</strong> The ability to handle growth.</li>
                        <li><strong className="text-black">Maintainability:</strong> The ease with which code can be modified.</li>
                        <li><strong className="text-black">Reliability:</strong> The system's ability to function correctly under expected conditions.</li>
                    </ul>
                    <p>
                        As we progress through this course, keep these three pillars in mind. They will serve as our compass for evaluating trade-offs.
                    </p>
                </div>
            </div>
        </div>
    );
}

function QuizView({ title }: { title: string }) {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="w-full h-full bg-gray-50 p-12 overflow-y-auto flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
                <div className="mb-8">
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full uppercase tracking-wider">Pop Quiz</span>
                    <h2 className="text-2xl font-bold mt-4 mb-2">{title}</h2>
                    <p className="text-gray-500">Test your knowledge from the previous lessons.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="font-medium text-lg text-gray-900 border-l-4 border-black pl-4 mb-6">
                        What is the primary benefit of using a Virtual DOM in React?
                    </p>

                    {[
                        "Directly modifies the browser DOM for faster updates",
                        "Minimizes the number of direct DOM manipulations",
                        "Automatically optimizes CSS styles",
                        "Replaces the need for JavaScript entirely"
                    ].map((opt, i) => (
                        <div
                            key={i}
                            onClick={() => !submitted && setSelected(i)}
                            className={cn(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                                selected === i
                                    ? (submitted ? (i === 1 ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") : "border-black bg-gray-50")
                                    : "border-gray-100 hover:border-gray-300"
                            )}
                        >
                            <span className={cn("font-medium", selected === i ? "text-black" : "text-gray-600")}>{opt}</span>
                            {submitted && selected === i && (
                                i === 1 ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                    {!submitted ? (
                        <button
                            onClick={() => setSubmitted(true)}
                            disabled={selected === null}
                            className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={() => { setSubmitted(false); setSelected(null); }}
                            className="px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Try Another
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface PageProps {
    params: Promise<{ courseId: string }>;
}

export default function LearnPage(props: PageProps) {
    const params = use(props.params);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"content" | "lab">("content");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // State for the currently viewing lesson (Full Object + Context)
    const [activeLesson, setActiveLesson] = useState<(Lesson & { sectionTitle: string }) | null>(null);

    useEffect(() => {
        const savedCourses = localStorage.getItem("instructor_courses");
        let foundCourse: any = null;

        if (savedCourses) {
            try {
                const parsed = JSON.parse(savedCourses);
                foundCourse = parsed.find((c: any) => c.id === params.courseId);
            } catch (e) {
                console.error("Error parsing saved courses", e);
            }
        }

        if (!foundCourse) {
            foundCourse = mockCourses.find((c) => c.id === params.courseId);
        }

        if (foundCourse) {
            setCourse(foundCourse);

            // Set initial active lesson
            if (foundCourse.curriculum && foundCourse.curriculum.length > 0) {
                const firstSection = foundCourse.curriculum[0];
                let firstLesson = null;

                // Handle mock vs real structure
                if (firstSection.lessons && firstSection.lessons.length > 0) {
                    firstLesson = firstSection.lessons[0];
                } else if (firstSection.items && firstSection.items.length > 0) {
                    // Convert string item to object for mock compatibility
                    firstLesson = {
                        id: 'mock-1',
                        title: firstSection.items[0],
                        type: 'video',
                        duration: '5:00'
                    };
                }

                if (firstLesson) {
                    setActiveLesson({
                        ...firstLesson,
                        sectionTitle: firstSection.title
                    });
                }
            }
        }

        setLoading(false);
    }, [params.courseId]);

    if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (!course) return notFound();

    const renderCurriculum = () => {
        return course.curriculum.map((section: any, i: number) => {
            // Normalized items
            const items: Lesson[] = section.lessons ? section.lessons : (section.items ? section.items.map((item: string, idx: number) => ({
                id: `mock-${i}-${idx}`,
                title: item,
                type: 'video',
                duration: '10:00'
            })) : []);

            return (
                <div key={`${i}-${section.title}`}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{section.title}</h3>
                    <div className="space-y-1">
                        {items.map((item, j) => {
                            const isActive = activeLesson?.title === item.title;

                            return (
                                <div
                                    key={`${j}-${item.title}`}
                                    onClick={() => setActiveLesson({ ...item, sectionTitle: section.title })}
                                    className={cn(
                                        "group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                                        isActive ? "bg-gray-800" : "hover:bg-gray-800/50"
                                    )}
                                >
                                    {/* Icon based on type */}
                                    <div className={cn("mt-0.5", isActive ? "text-green-500" : "text-gray-600")}>
                                        {item.type === 'quiz' ? <HelpCircle className="w-4 h-4" /> :
                                            item.type === 'article' ? <FileText className="w-4 h-4" /> :
                                                <PlayCircle className="w-4 h-4" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className={cn("text-sm transition-colors", isActive ? "text-gray-200 font-medium" : "text-gray-500 group-hover:text-gray-300")}>
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-0.5 font-mono">{item.duration}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">

            {/* Top Bar */}
            <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/courses`} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-gray-200">{course.title}</h1>
                        <p className="text-xs text-gray-500">{activeLesson?.sectionTitle || "Course View"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                    <button
                        onClick={() => setActiveTab("content")}
                        className={cn(
                            "px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === "content" ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        {activeLesson?.type === 'quiz' ? <HelpCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                        {activeLesson?.type === 'quiz' ? 'Quiz' : 'Lesson'}
                    </button>
                    <button
                        onClick={() => setActiveTab("lab")}
                        className={cn(
                            "px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === "lab" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <TerminalIcon className="w-3.5 h-3.5" /> Sandbox
                    </button>
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Center Stage */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
                    {activeTab === "content" ? (
                        <div className="flex-1 flex flex-col">
                            {/* Render different views relative to lesson type */}
                            {activeLesson?.type === 'video' || !activeLesson?.type ? (
                                <>
                                    <div className="flex-1 relative bg-black">
                                        <VideoPlayer title={activeLesson?.title || "Video"} content={activeLesson?.content} />
                                    </div>
                                    <div className="h-1/3 bg-[#111] border-t border-gray-800 p-8 overflow-y-auto">
                                        <h2 className="text-2xl font-bold mb-4">{activeLesson?.title}</h2>
                                        <p className="text-gray-400 leading-relaxed max-w-3xl">
                                            {activeLesson?.content || "In this lesson, we explore the core concepts required to master this topic. Pay close attention to the examples provided in the video."}
                                        </p>
                                    </div>
                                </>
                            ) : activeLesson.type === 'article' ? (
                                <ArticleView title={activeLesson.title} content={activeLesson.content} />
                            ) : (
                                <QuizView title={activeLesson.title} />
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 p-4 bg-[#0a0a0a] flex flex-col">
                            <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-mono text-blue-200">Environment Active: t2.micro (AWS us-east-1)</span>
                                </div>
                                <span className="text-xs text-blue-300 font-mono">Time remaining: 58:00</span>
                            </div>
                            <div className="flex-1">
                                <Terminal />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar (Curriculum) */}
                <aside className={cn(
                    "w-80 border-l border-gray-800 bg-[#111] transition-all duration-300 flex flex-col absolute right-0 top-0 bottom-0 z-10 md:relative",
                    !sidebarOpen && "translate-x-full w-0 opacity-0 md:opacity-100 border-none"
                )}>
                    <div className="p-4 border-b border-gray-800 font-bold text-sm text-gray-300">
                        Course Content
                    </div>
                    <div className="overflow-y-auto flex-1 p-4 space-y-6">
                        {renderCurriculum()}
                    </div>
                </aside>

            </div>
        </div>
    );
}
