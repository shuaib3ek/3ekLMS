"use client";

import { useEffect, useState } from "react";
import { Users, Building2, Layers, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        users: 0,
        orgs: 0,
        courses: 0,
        batches: 0
    });

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            // Lazy load the server action
            const { getSystemAnalytics } = await import("@/actions/lms");
            const data = await getSystemAnalytics(user.orgId);
            setStats({
                users: data.totalUsers,
                orgs: 1, // Single Tenant for now
                courses: 0, // Pending implementation
                batches: data.activeBatches
            });
        };
        load();
    }, [user]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-gray-500 mt-1">System health and aggregated metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Users" value={stats.users} icon={Users} color="blue" />
                <StatCard label="Organizations" value={stats.orgs} icon={Building2} color="purple" />
                <StatCard label="Active Programs" value={stats.courses} icon={Layers} color="orange" />
                <StatCard label="Running Batches" value={stats.batches} icon={Activity} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Chart 1: User Activity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">User Activity (Last 7 Days)</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 h-48 px-2">
                        {[40, 65, 30, 85, 50, 75, 90].map((h, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                                <div
                                    className="w-full bg-blue-100 rounded-t-lg relative group-hover:bg-blue-200 transition-all duration-300"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded font-bold transition-opacity">
                                        {h} users
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 font-bold">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual Chart 2: Batch Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Batch Status Distribution</h3>
                    <div className="flex-1 flex items-center justify-center gap-8">
                        {/* CSS Donut Chart approximation or Simple Legend Bar */}
                        <div className="space-y-4 w-full">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold text-gray-700"><span>Active Batches</span> <span>65%</span></div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[65%] rounded-full"></div></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold text-gray-700"><span>Pending Setup</span> <span>25%</span></div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[25%] rounded-full"></div></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold text-gray-700"><span>Completed</span> <span>10%</span></div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[10%] rounded-full"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table (Visual) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent System Alerts</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <p className="text-sm text-gray-600 flex-1">New Batch <strong>Full Stack Java</strong> requires instructor assignment.</p>
                            <span className="text-xs text-gray-400">2h ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600"
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
