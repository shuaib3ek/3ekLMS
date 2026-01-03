"use client";

import { use, useState, useEffect } from "react";
import {
    GripVertical,
    Plus,
    Pencil,
    Trash2,
    Video,
    FileText,
    ChevronDown,
    ChevronRight,
    UploadCloud,
    Layout,
    X,
    Save
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageProps {
    params: Promise<{ courseId: string }>;
}

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'article' | 'quiz';
    duration: string;
    content?: string; // URL or text body
}

interface Section {
    id: string;
    title: string;
    lessons: Lesson[];
}

export default function CourseEditorPage(props: PageProps) {
    const params = use(props.params);
    const router = useRouter();
    const [courseTitle, setCourseTitle] = useState("Loading...");
    const [sections, setSections] = useState<Section[]>([]);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Editing State
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null); // For knowing where to update the lesson

    // Load Data
    useEffect(() => {
        const loadData = () => {
            const savedCourses = localStorage.getItem("instructor_courses");
            const allCourses = savedCourses ? JSON.parse(savedCourses) : [];
            const course = allCourses.find((c: any) => c.id === params.courseId);

            if (course) {
                setCourseTitle(course.title);
                // Load curriculum if it exists, otherwise default
                if (course.curriculum) {
                    setSections(course.curriculum);
                    // Expand all by default
                    const expanded: Record<string, boolean> = {};
                    course.curriculum.forEach((s: Section) => expanded[s.id] = true);
                    setExpandedSections(expanded);
                } else {
                    // Default starter curriculum
                    const starter = [
                        {
                            id: `sec_${Date.now()}`,
                            title: "Introduction",
                            lessons: [
                                { id: `les_${Date.now()}`, title: "Welcome", type: "video" as const, duration: "2:00", content: "" }
                            ]
                        }
                    ];
                    setSections(starter);
                    setExpandedSections({ [starter[0].id]: true });
                }
            } else {
                setCourseTitle("Course Not Found");
            }
        };
        loadData();
    }, [params.courseId]);

    // Actions
    const saveCourse = () => {
        setIsSaving(true);
        const savedCourses = localStorage.getItem("instructor_courses");
        if (savedCourses) {
            const allCourses = JSON.parse(savedCourses);
            const updatedCourses = allCourses.map((c: any) => {
                if (c.id === params.courseId) {
                    return { ...c, curriculum: sections, lastUpdated: "Just now" };
                }
                return c;
            });
            localStorage.setItem("instructor_courses", JSON.stringify(updatedCourses));
        }
        setTimeout(() => setIsSaving(false), 800);
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addSection = () => {
        const newSection: Section = {
            id: `sec_${crypto.randomUUID()}`,
            title: "New Section",
            lessons: []
        };
        setSections([...sections, newSection]);
        setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
    };

    const deleteSection = (sectionId: string) => {
        if (confirm("Are you sure you want to delete this section?")) {
            setSections(sections.filter(s => s.id !== sectionId));
        }
    };

    const addLesson = (sectionId: string) => {
        const newLesson: Lesson = {
            id: `les_${crypto.randomUUID()}`,
            title: "New Lesson",
            type: "video",
            duration: "5:00",
            content: ""
        };
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                return { ...s, lessons: [...s.lessons, newLesson] };
            }
            return s;
        }));
        // Auto open editor
        setActiveSectionId(sectionId);
        setEditingLesson(newLesson);
    };

    const updateLesson = (updated: Lesson) => {
        if (!activeSectionId) return;
        setSections(sections.map(s => {
            if (s.id === activeSectionId) {
                return {
                    ...s,
                    lessons: s.lessons.map(l => l.id === updated.id ? updated : l)
                };
            }
            return s;
        }));
        setEditingLesson(updated);
    };

    const deleteLesson = (sectionId: string, lessonId: string) => {
        if (confirm("Delete this lesson?")) {
            setSections(sections.map(s => {
                if (s.id === sectionId) {
                    return { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) };
                }
                return s;
            }));
            if (editingLesson?.id === lessonId) setEditingLesson(null);
        }
    };

    const initiateEditLesson = (sectionId: string, lesson: Lesson) => {
        setActiveSectionId(sectionId);
        setEditingLesson(lesson);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <div className="bg-black text-white h-16 px-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-4">
                    <Link href="/instructor/courses" className="text-gray-400 hover:text-white transition-colors">
                        &larr; Back
                    </Link>
                    <h1 className="font-bold text-lg border-l border-gray-700 pl-4">{courseTitle}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 hidden sm:inline">{isSaving ? "Saving..." : "Unsaved changes"}</span>
                    <button
                        onClick={saveCourse}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-black text-sm font-bold rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? "Saved" : "Save"}
                    </button>
                </div>
            </div>

            <div className="flex-1 max-w-6xl mx-auto w-full p-8 flex gap-8">

                {/* Main Content: Curriculum Editor */}
                <div className="flex-1">
                    {/* Curriculum Header */}
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Curriculum</h2>
                            <p className="text-gray-500">Structure your course by creating sections and lessons.</p>
                        </div>
                        <button
                            onClick={addSection}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Section
                        </button>
                    </div>

                    {/* Sections List */}
                    <div className="space-y-4 pb-20">
                        {sections.map((section) => (
                            <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Section Header */}
                                <div className="bg-gray-50 p-4 flex items-center gap-3 border-b border-gray-100">
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                                    <button onClick={() => toggleSection(section.id)} className="hover:bg-gray-200 rounded p-0.5 transition-colors">
                                        {expandedSections[section.id] ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                                    </button>

                                    {/* Editable Section Title (Simple prompt for now) */}
                                    <input
                                        className="font-bold text-gray-800 text-sm flex-1 bg-transparent border-none focus:ring-0 p-0"
                                        value={section.title}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setSections(sections.map(s => s.id === section.id ? { ...s, title: newTitle } : s));
                                        }}
                                    />

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => deleteSection(section.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => addLesson(section.id)}
                                            className="ml-2 flex items-center gap-1 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Lesson
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                {expandedSections[section.id] && (
                                    <div className="p-2 bg-gray-50/50 space-y-2">
                                        {section.lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                onClick={() => initiateEditLesson(section.id, lesson)}
                                                className={`flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-blue-400 transition-all group cursor-pointer ${editingLesson?.id === lesson.id ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-gray-100'}`}
                                            >
                                                <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 cursor-grab" />
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                    {lesson.type === 'video' && <Video className="w-4 h-4" />}
                                                    {lesson.type === 'article' && <FileText className="w-4 h-4" />}
                                                    {lesson.type === 'quiz' && <Layout className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                                    <p className="text-xs text-gray-400">{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} • {lesson.duration}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteLesson(section.id, lesson.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {section.lessons.length === 0 && (
                                            <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-white/50">
                                                <p className="text-xs text-gray-400">Empty section</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: Lesson Editor */}
                {editingLesson ? (
                    <div className="w-80 h-fit bg-white border border-gray-200 rounded-xl shadow-lg sticky top-24 p-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Edit Lesson</h3>
                            <button onClick={() => setEditingLesson(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={editingLesson.title}
                                    onChange={(e) => updateLesson({ ...editingLesson, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={editingLesson.type}
                                    onChange={(e) => updateLesson({ ...editingLesson, type: e.target.value as any })}
                                >
                                    <option value="video">Video</option>
                                    <option value="article">Article</option>
                                    <option value="quiz">Quiz</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={editingLesson.duration}
                                    onChange={(e) => updateLesson({ ...editingLesson, duration: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content URL / Body</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[100px]"
                                    value={editingLesson.content || ""}
                                    onChange={(e) => updateLesson({ ...editingLesson, content: e.target.value })}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button onClick={() => setEditingLesson(null)} className="w-full py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex w-80 h-64 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center text-center p-6 text-gray-400 sticky top-24">
                        <div>
                            <Pencil className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Select a lesson to edit details</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
