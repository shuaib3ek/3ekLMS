"use client";

import {
    Users,
    BookOpen,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInstructorAnalyticsAction, AnalyticsSummary } from "@/actions/analytics";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const data = await getInstructorAnalyticsAction(user.id);
            setStats(data);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div className="p-8">Loading Analytics...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-500 mt-1">Track the performance of your courses and student engagement.</p>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Students", value: stats?.totalStudents || 0, change: "Live", trend: "up", icon: Users, color: "bg-blue-50 text-blue-600" },
                    { label: "Active Batches", value: stats?.activeBatches || 0, change: "Live", trend: "up", icon: TrendingUp, color: "bg-green-50 text-green-600" },
                    { label: "Quiz Passes", value: stats?.quizCompletions || 0, change: "All Time", trend: "up", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
                    { label: "Avg. Watch Time", value: "~45m", change: "Est.", trend: "down", icon: Clock, color: "bg-orange-50 text-orange-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Engagement Chart Section (Mock Visual) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Engagement Overview</h2>
                            <p className="text-sm text-gray-500">Daily active students over the last 30 days (Simulated)</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg px-3 py-2 outline-none">
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    {/* CSS Bar Chart Simulation - Static for now */}
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 65, 45, 80, 55, 70, 40, 50, 60, 75, 85, 90, 60, 50, 70, 80, 95, 100, 80, 70, 60, 50, 65, 75, 80, 60, 50, 70, 85, 90].map((h, i) => (
                            <div key={i} className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-600 transition-colors group relative cursor-pointer" style={{ height: `${h}%` }}>
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded font-bold whitespace-nowrap z-10">
                                    {h} Users
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performing Batches */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Top Batches</h2>
                    <div className="space-y-6">
                        {(stats?.topBatches || []).length === 0 && <p className="text-gray-500">No active batches found.</p>}

                        {(stats?.topBatches || []).map((batch, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 font-bold flex items-center justify-center">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{batch.name}</h4>
                                        <p className="text-xs text-gray-500">{batch.studentCount} students</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">Active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        View Full Report
                    </button>
                </div>
            </div>
        </div>
    );
}
