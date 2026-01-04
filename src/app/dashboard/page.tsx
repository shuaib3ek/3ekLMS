"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowUpRight, PlayCircle, Clock, Trophy, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { courses as mockCourses } from "@/lib/mockData";

export default function Dashboard() {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const firstName = user ? user.name.split(" ")[0] : "Student";

    const [stats, setStats] = useState({
        activeCourses: 0,
        hoursLearned: 0,
        certificates: 0
    });
    const [recentCourses, setRecentCourses] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Load data
        const savedEnrollments = localStorage.getItem("student_enrollments");
        const enrolledIds = savedEnrollments ? JSON.parse(savedEnrollments) : [];

        // Load all courses database (Instructor + Mock)
        const savedInstructorCourses = localStorage.getItem("instructor_courses");
        const instructorCourses = savedInstructorCourses ? JSON.parse(savedInstructorCourses) : [];

        // Normalize instructor courses
        const normalizedInstructorCourses = instructorCourses.map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category || "Development",
            // Map to dashboard specific mock props
            progress: 0,
            type: "Course",
            color: "bg-blue-100 text-blue-700"
        }));

        const uniqueNormalized = normalizedInstructorCourses.filter((item: any, index: number, self: any[]) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        // Mock catalog (subset used in other files)
        const catalog = [
            ...mockCourses.map(c => ({
                id: c.id,
                title: c.title,
                progress: 0, // Mock progress
                type: "Course",
                color: "bg-purple-100 text-purple-700"
            })),
            ...uniqueNormalized
        ];

        // Filter enrolled
        const myCourses = catalog.filter(c => enrolledIds.includes(c.id));

        setStats({
            activeCourses: myCourses.length,
            hoursLearned: Math.round(myCourses.length * 2.5), // Mock calc
            certificates: 0
        });

        setRecentCourses(myCourses.slice(0, 3));

    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {firstName}.</h1>
                    <p className="text-gray-500">
                        {stats.activeCourses > 0
                            ? "Pick up where you left off."
                            : "Ready to start your learning journey?"}
                    </p>
                </div>
                {recentCourses.length > 0 ? (
                    <Link href={`/learn/${recentCourses[0].id}`} className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                        <PlayCircle className="w-4 h-4" /> Resume Learning
                    </Link>
                ) : (
                    <Link href="/courses" className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                        <ArrowRight className="w-4 h-4" /> Browse Catalog
                    </Link>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Hours Learned", value: `${stats.hoursLearned}h`, icon: Clock },
                    { label: "Active Courses", value: stats.activeCourses.toString(), icon: PlayCircle },
                    { label: "Certificates", value: stats.certificates.toString(), icon: Trophy },
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all duration-300">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Courses */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Jump back in</h2>
                    <Link href="/dashboard/courses" className="text-sm font-medium text-gray-500 hover:text-black hover:underline">View all</Link>
                </div>

                {recentCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentCourses.map((course, i) => (
                            <Link key={i} href={`/learn/${course.id}`} className="group p-6 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer block">
                                <div className="flex items-start justify-between mb-8">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.color || "bg-gray-100 text-gray-700"}`}>{course.category || "Course"}</span>
                                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4 pr-4 line-clamp-1">{course.title}</h3>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                        <span>Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="w-full py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <PlayCircle className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">No active courses</h3>
                        <p className="text-gray-500 max-w-sm mb-6">You haven't enrolled in any courses yet. Visit the library to get started.</p>
                        <Link href="/courses" className="text-blue-600 font-bold hover:underline">
                            Go to Library &rarr;
                        </Link>
                    </div>
                )}
            </section>

        </div>
    );
}
