"use client";

import { useEffect, useState } from "react";
import { Terminal, Play, Cpu, Box, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { db, LabSession } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

export default function LabsPage() {
    const { user } = useAuth();
    const [activeSession, setActiveSession] = useState<LabSession | null>(null);
    const [isProvisioning, setIsProvisioning] = useState(false);

    const environments = [
        {
            id: "node-18",
            name: "Node.js 18 LTS",
            description: "Full Node.js runtime with npm, yarn, and pnpm pre-installed.",
            status: "Ready",
            cpu: "2 vCPU",
            ram: "4GB RAM",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
        },
        {
            id: "python-3",
            name: "Python 3.11 Data Sci",
            description: "Optimized for data science with Pandas, NumPy, and PyTorch.",
            status: "Ready",
            cpu: "4 vCPU",
            ram: "8GB RAM",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
        },
        {
            id: "go-1",
            name: "Go 1.21",
            description: "Fast compilation implementation environment for Systems Programming.",
            status: "Maintenance",
            cpu: "2 vCPU",
            ram: "4GB RAM",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
        },
        {
            id: "rust-stable",
            name: "Rust Stable",
            description: "Memory safe systems programming environment.",
            status: "Ready",
            cpu: "2 vCPU",
            ram: "4GB RAM",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg"
        }
    ];

    const refreshSession = () => {
        if (!user) return;
        const sessions = db.labSessions.getByUser(user.id);
        const active = sessions.find(s => s.status !== 'TERMINATED');
        setActiveSession(active || null);
    };

    useEffect(() => {
        db.init();
        refreshSession();

        // Poll for updates if active
        const interval = setInterval(refreshSession, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLaunch = (envId: any) => {
        if (!user) return;
        setIsProvisioning(true);

        setTimeout(() => {
            const newSession: LabSession = {
                id: crypto.randomUUID(),
                userId: user.id,
                environment: envId.toUpperCase(),
                status: 'RUNNING',
                startedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
                instanceUrl: `https://ide-${envId}-${crypto.randomUUID().slice(0, 4)}.glocumal.com`
            };
            db.labSessions.create(newSession);
            setIsProvisioning(false);
            refreshSession();
        }, 2000); // Simulate provisioning delay
    };

    const handleTerminate = () => {
        if (activeSession) {
            db.labSessions.terminate(activeSession.id);
            refreshSession();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Lab Sandbox</h1>
                <p className="text-gray-500 mt-2">Spin up ephemeral cloud environments to test your code in seconds.</p>
            </div>

            {/* Active Sessions */}
            {activeSession ? (
                <div className="bg-black text-white rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />

                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                {activeSession.status === 'PROVISIONING' ? 'Provisioning...' : 'Active Session'}
                            </div>
                            <h3 className="text-xl font-bold mb-1">{activeSession.environment} Environment</h3>
                            <p className="text-gray-400 text-sm">Instance ID: {activeSession.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleTerminate}
                                className="px-4 py-2.5 bg-gray-800 text-white text-sm font-bold rounded-xl hover:bg-red-900/50 hover:text-red-200 transition-colors flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" /> Terminate
                            </button>
                            <Link href="#" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <Terminal className="w-4 h-4" /> Open Terminal
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Environments Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isProvisioning ? 'opacity-50 pointer-events-none' : ''}`}>
                {environments.map((env) => (
                    <div key={env.id} className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center p-2 border border-gray-100">
                                <img src={env.icon} alt={env.name} className="w-full h-full object-contain" />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${env.status === 'Ready' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                {env.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">{env.name}</h3>
                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">{env.description}</p>

                        <div className="flex items-center gap-4 mb-6 text-xs font-medium text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Cpu className="w-4 h-4" /> {env.cpu}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Box className="w-4 h-4" /> {env.ram}
                            </span>
                        </div>

                        <button
                            onClick={() => handleLaunch(env.id)}
                            disabled={env.status !== 'Ready' || !!activeSession}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProvisioning && activeSession?.environment === env.id.toUpperCase() ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            {activeSession ? 'Session Active' : 'Launch Sandbox'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
