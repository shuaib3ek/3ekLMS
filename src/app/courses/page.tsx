"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Clock, Users, Star, ArrowRight } from "lucide-react";
import { courses } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
    const [allCourses, setAllCourses] = useState<any[]>(courses);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categories = ["All", "Cloud", "DevOps", "Development", "AI", "Security"];

    useEffect(() => {
        const savedCourses = localStorage.getItem("instructor_courses");
        if (savedCourses) {
            try {
                const parsed = JSON.parse(savedCourses);
                if (Array.isArray(parsed)) {
                    // Normalize instructor courses to catalog format
                    const normalizedValues = parsed.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description || "A comprehensive course designed to master key concepts and practical skills.",
                        category: c.category || "Development",
                        image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2831&auto=format&fit=crop", // Default tech image
                        duration: "5h 30m", // Default or calculated
                        level: "Beginner",
                        rating: c.rating || 4.5,
                        students: c.students || 0,
                        instructor: {
                            name: "Instructor",
                            role: "Senior Developer",
                            image: "https://ui-avatars.com/api/?name=Instructor"
                        },
                        chapters: 10,
                        hasLab: false
                    }));

                    // Deduplicate normalized values themselves (in case localStorage has dupes)
                    const uniqueNormalized = normalizedValues.filter((item: any, index: number, self: any[]) =>
                        index === self.findIndex((t) => t.id === item.id)
                    );

                    // Merge avoiding duplicates (by ID) with existing mock data
                    setAllCourses(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = uniqueNormalized.filter((n: any) => !existingIds.has(n.id));
                        return [...prev, ...uniqueNew];
                    });
                }
            } catch (e) {
                console.error("Failed to load instructor courses", e);
            }
        }
    }, []);

    const filteredCourses = selectedCategory === "All"
        ? allCourses
        : allCourses.filter(c => c.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">

            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Library</h1>
                    <p className="text-gray-600 max-w-2xl text-lg">
                        Explore our curated collection of verified skills pathways. From Cloud Computing to Generative AI, master the tech of tomorrow.
                    </p>

                    <div className="mt-10 flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for Python, AWS, Security..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all font-medium"
                            />
                        </div>

                        {/* Filters Button (Visual Mockup) */}
                        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0 w-full md:w-auto justify-center">
                            <Filter className="w-5 h-5" /> Filters
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                                    selectedCategory === cat
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <Link
                            href={`/courses/${course.id}`}
                            key={course.id}
                            className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Image */}
                            <div className="h-56 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                                        {course.category}
                                    </span>
                                </div>
                            </div>

                            {/* Data */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                </div>

                                <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                    {course.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" /> {course.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {course.rating}
                                        </span>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
