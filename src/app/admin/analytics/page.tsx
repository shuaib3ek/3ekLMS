"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    ShieldAlert,
    User,
    Download
} from "lucide-react";

export default function AdminAnalyticsPage() {
    const [logs, setLogs] = useState<any[]>([
        { id: '1', action: 'USER_LOGIN', userId: 'user_admin', details: 'Successful login', severity: 'INFO', timestamp: new Date().toISOString() },
        { id: '2', action: 'BATCH_CREATED', userId: 'user_admin', details: 'Created batch "Feb 2026 Cohort"', severity: 'INFO', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', action: 'FAILED_LOGIN', userId: 'unknown', details: 'Failed login attempt', severity: 'WARNING', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ]);

    // Future: Implement real audit logging
    useEffect(() => { }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Analytics & Audit</h1>
                    <p className="text-gray-500 mt-1">Monitor platform activity, security events, and usage metrics.</p>
                </div>
                <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Total Activity</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">1,204</p>
                    <p className="text-xs text-green-600 font-bold mt-1">+12% from last week</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Security Events</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-gray-500 font-bold mt-1">Last 7 days</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">API Requests</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">84.2k</p>
                    <p className="text-xs text-gray-500 font-bold mt-1">Avg 120ms latency</p>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">Audit Logs</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    {log.severity === 'INFO' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {log.severity === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                                    {log.severity === 'CRITICAL' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">{log.action}</td>
                                <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                                    <User className="w-4 h-4" /> {log.userId}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{log.details}</td>
                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
