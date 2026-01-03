"use client";

import { useEffect, useState } from "react";
import { DollarSign, Users, BookOpen, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function InstructorDashboard() {
    const [stats, setStats] = useState([
        { label: "Total Revenue", value: "...", change: "+0%", trend: "up", icon: DollarSign },
        { label: "Active Students", value: "...", change: "+0%", trend: "up", icon: Users },
        { label: "Active Courses", value: "...", change: "0", trend: "up", icon: BookOpen },
    ]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        // Load data from local storage
        const savedCourses = localStorage.getItem("instructor_courses");
        const courses = savedCourses ? JSON.parse(savedCourses) : [];

        const savedEnrollments = localStorage.getItem("student_enrollments");
        const enrollments = savedEnrollments ? JSON.parse(savedEnrollments) : [];

        // Calculate Stats
        const courseCount = courses.length;
        const enrollmentCount = enrollments.length;
        // Mock revenue: $49.99 per enrollment
        const revenue = enrollmentCount * 49.99;

        setStats([
            {
                label: "Total Revenue",
                value: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: "+12.5%",
                trend: "up",
                icon: DollarSign
            },
            {
                label: "Total Enrollments",
                value: enrollmentCount.toString(),
                change: "+4.2%",
                trend: "up",
                icon: Users
            },
            {
                label: "Active Courses",
                value: courseCount.toString(),
                change: "+1",
                trend: "up",
                icon: BookOpen
            },
        ]);

        // Generate semi-dynamic recent activity
        // If we have enrollments, map them to "Recent Enrollments"
        if (enrollments.length > 0) {
            const activities = enrollments.slice(0, 5).map((courseId: string, i: number) => {
                const course = courses.find((c: any) => c.id === courseId) || { title: "Unknown Course" };
                return {
                    user: `Student ${i + 1}`,
                    action: `enrolled in ${course.title}`,
                    time: "Recently"
                };
            });
            setRecentActivity(activities);
        } else {
            setRecentActivity([
                { user: "System", action: "Welcome to your new dashboard", time: "Just now" }
            ]);
        }

    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back. Here's what's happening with your courses today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.label === "Total Revenue" ? "bg-green-100 text-green-600" : stat.label === "Total Enrollments" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={`hidden flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    {recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors -mx-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                    {activity.user.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{activity.user}</p>
                                    <p className="text-xs text-gray-500">{activity.action}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
