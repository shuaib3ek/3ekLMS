"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Users, Building2, Layers, Activity } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        orgs: 0,
        courses: 0,
        batches: 0
    });

    useEffect(() => {
        db.init();
        setStats({
            users: db.users.getAll().length,
            orgs: 1, // Mock
            courses: db.programs.getAll().length,
            batches: db.batches.getAll().length
        });
    }, []);

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
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-64 flex items-center justify-center text-gray-400 font-medium italic">
                    License Usage Chart (Placeholder)
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-64 flex items-center justify-center text-gray-400 font-medium italic">
                    System Load (Placeholder)
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
