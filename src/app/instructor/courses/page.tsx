"use client";

import Link from "next/link";
import { Plus, Search, MoreVertical, FileEdit, Trash2, GraduationCap, Clock, Signal } from "lucide-react";
import { useState, useEffect } from "react";

interface Course {
    id: string;
    title: string;
    status: string;
    students: number;
    rating: number;
    lastUpdated: string;
    thumbnail: string;
}

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([
        {
            id: "1",
            title: "Advanced AWS Networking",
            status: "Published",
            students: 1240,
            rating: 4.8,
            lastUpdated: "2 days ago",
            thumbnail: "bg-blue-100"
        },
        {
            id: "2",
            title: "React Design Patterns",
            status: "Draft",
            students: 0,
            rating: 0,
            lastUpdated: "5 hours ago",
            thumbnail: "bg-purple-100"
        },
        {
            id: "3",
            title: "Kubernetes Security",
            status: "Published",
            students: 850,
            rating: 4.9,
            lastUpdated: "1 week ago",
            thumbnail: "bg-orange-100"
        }
    ]);

    useEffect(() => {
        const savedCourses = localStorage.getItem("instructor_courses");
        if (savedCourses) {
            try {
                const parsed = JSON.parse(savedCourses);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Get IDs of currently displayed courses
                    const existingIds = new Set(courses.map(c => c.id));

                    // Filter out courses that are already displayed OR have duplicate IDs within the storage itself
                    const uniqueNewCourses: Course[] = [];
                    const seenStorageIds = new Set();

                    parsed.forEach((c: any) => {
                        if (!existingIds.has(c.id) && !seenStorageIds.has(c.id)) {
                            uniqueNewCourses.push(c);
                            seenStorageIds.add(c.id);
                        }
                    });

                    if (uniqueNewCourses.length > 0) {
                        setCourses(prev => {
                            const currentIds = new Set(prev.map(c => c.id));
                            const actuallyUnique = uniqueNewCourses.filter(c => !currentIds.has(c.id));
                            return [...prev, ...actuallyUnique];
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to parse courses", e);
            }
        }
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage your content and track student progress.</p>
                </div>
                <Link
                    href="/instructor/create"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" /> Create New Course
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4 mb-8 bg-white p-2 pr-4 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <select className="text-sm font-medium text-gray-600 bg-transparent focus:outline-none cursor-pointer">
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Archived</option>
                </select>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                        {/* Thumbnail Placeholder */}
                        <div className={`aspect-video rounded-xl ${course.thumbnail} mb-4 relative overflow-hidden`}>
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                                {course.status}
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
                            <button className="text-gray-400 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4" />
                                <span>{course.students}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Signal className="w-4 h-4" />
                                <span>{course.rating > 0 ? course.rating : 'New'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-auto text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{course.lastUpdated}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                            <Link href={`/instructor/course/${course.id}/edit`} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <FileEdit className="w-4 h-4" /> Edit
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this course?")) {
                                        // Update Local State
                                        const newCourses = courses.filter(c => c.id !== course.id);
                                        setCourses(newCourses);

                                        // Update Storage
                                        const stored = localStorage.getItem("instructor_courses");
                                        if (stored) {
                                            const parsed = JSON.parse(stored);
                                            const updated = parsed.filter((c: any) => c.id !== course.id);
                                            localStorage.setItem("instructor_courses", JSON.stringify(updated));
                                        }
                                    }
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                ))}

                {/* New Course Card */}
                <Link href="/instructor/create" className="group rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">Create New Course</h3>
                        <p className="text-sm text-gray-500">Start building your next masterpiece</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
