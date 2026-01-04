"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Batch, Program, Session } from "@prisma/client";
import { useAuth } from "@/context/AuthContext";
import { getBatchDetails } from "@/actions/lms";
import {
    Calendar,
    Clock,
    MapPin,
    UserCheck,
    CheckCircle2,
    FlaskConical,
    Users
} from "lucide-react";

type BatchDetails = Batch & {
    program: Program;
    sessions: (Session & { startTime: string, endTime: string })[]; // Override Date with string from JSON
    students: any[];
}

export default function BatchDeliveryPage() {
    // --- Hooks ---
    const { user: currentUser } = useAuth(); // Access auth
    const params = useParams();
    const batchId = params.id as string;

    const [data, setData] = useState<BatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSessionIndex, setActiveSessionIndex] = useState(0);

    // --- Bulk Enrollment Modal State ---
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [csvInput, setCsvInput] = useState("");
    const [enrollStatus, setEnrollStatus] = useState<"IDLE" | "PROCESSING" | "SUCCESS" | "ERROR">("IDLE");
    const [enrollResult, setEnrollResult] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const res = await getBatchDetails(batchId);
            if (res) {
                // Determine active session (closest upcoming)
                const now = new Date();
                let activeIdx = res.sessions.findIndex(s => new Date(s.endTime) > now);
                if (activeIdx === -1 && res.sessions.length > 0) activeIdx = res.sessions.length - 1; // All done
                if (activeIdx === -1) activeIdx = 0; // No sessions

                setData(res as any);
                setActiveSessionIndex(activeIdx);
            }
            setLoading(false);
        };
        load();
    }, [batchId]);

    const handleBulkEnroll = async () => {
        if (!currentUser?.orgId || !data) {
            alert("Missing Context");
            return;
        }

        setEnrollStatus("PROCESSING");
        try {
            const rows = csvInput.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (rows.length === 0) throw new Error("Empty CSV");

            const parsedData = rows.map(row => {
                const parts = row.split(',');
                if (parts.length < 1) return null;
                return {
                    email: parts[0].trim(),
                    name: parts[1] ? parts[1].trim() : parts[0].split('@')[0],
                    role: 'LEARNER' as const
                };
            }).filter(Boolean) as any[];

            const { bulkEnrollStudentsAction } = await import("@/actions/enrollment");
            const result = await bulkEnrollStudentsAction(data.id, currentUser.orgId, parsedData);

            if (result.success) {
                setEnrollStatus("SUCCESS");
                setEnrollResult(result);
                setCsvInput("");
                // Reload data to update counts?
            } else {
                setEnrollStatus("ERROR");
                setEnrollResult(result);
            }

        } catch (e: any) {
            setEnrollStatus("ERROR");
            setEnrollResult({ success: false, errors: [e.message || "Unknown error"] });
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" /></div>;
    if (!data) return <div className="p-8">Batch not found</div>;

    const currentSession = data.sessions[activeSessionIndex];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            ACTIVE
                        </span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            {data.id}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
                    <p className="text-gray-500 mt-1">{data.program.title} • Instructor-Led Training</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowEnrollModal(true)}
                        className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Bulk Enroll
                    </button>
                    <div className="text-right px-4 border-l border-gray-100">
                        <p className="text-2xl font-bold text-gray-900">{data.students.length}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">Enrolled</p>
                    </div>

                </div>
            </div>

            {/* Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Bulk Enroll Students</h3>
                            <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-black">✖</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {enrollStatus === 'SUCCESS' ? (
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-center">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                                    <h4 className="font-bold text-lg">Successfully Enrolled!</h4>
                                    <p>{enrollResult?.count} students added to this batch.</p>
                                    <button
                                        onClick={() => { setEnrollStatus("IDLE"); setShowEnrollModal(false); }}
                                        className="mt-4 px-4 py-2 bg-green-600 text-white font-bold rounded-lg"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">
                                        Paste CSV data below. Format: <strong>email, name</strong> (one per line).
                                    </div>
                                    <textarea
                                        className="w-full h-64 p-4 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-black focus:outline-none"
                                        placeholder={`student1@example.com, John Doe\nstudent2@example.com, Jane Smith`}
                                        value={csvInput}
                                        onChange={(e) => setCsvInput(e.target.value)}
                                        disabled={enrollStatus === 'PROCESSING'}
                                    />
                                    {enrollStatus === 'ERROR' && (
                                        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                                            <strong>Error:</strong>
                                            <ul className="list-disc pl-4 mt-1">
                                                {enrollResult?.errors?.map((e: any, i: number) => <li key={i}>{e}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            onClick={() => setShowEnrollModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                                            disabled={enrollStatus === 'PROCESSING'}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBulkEnroll}
                                            className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                                            disabled={enrollStatus === 'PROCESSING' || !csvInput.trim()}
                                        >
                                            {enrollStatus === 'PROCESSING' ? 'Processing...' : 'Enroll Students'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schedule / Timeline */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Course Schedule
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-1">
                        {data.sessions.map((session, idx) => (
                            <button
                                key={session.id}
                                onClick={() => setActiveSessionIndex(idx)}
                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${activeSessionIndex === idx ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${new Date(session.endTime) < new Date() ? 'bg-green-500 text-white' :
                                    activeSessionIndex === idx ? 'bg-white text-black' : 'bg-gray-100'
                                    }`}>
                                    {new Date(session.endTime) < new Date() ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${activeSessionIndex === idx ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                                        {session.title}
                                    </p>
                                    <p className={`text-xs ${activeSessionIndex === idx ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(session.startTime).toLocaleDateString()}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Active Session Delivery */}
                <div className="lg:col-span-2 space-y-6">
                    {currentSession ? (
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSession.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" /> {new Date(currentSession.startTime).toLocaleTimeString()} - {new Date(currentSession.endTime).toLocaleTimeString()}
                                        </span>
                                        {currentSession.meetingLink && (
                                            <span className="flex items-center gap-1.5 text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => window.open(currentSession.meetingLink!, '_blank')}>
                                                <MapPin className="w-4 h-4" /> Join Meeting
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trainer Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" /> Attendance
                                    </h4>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Auto-Tracking Active</span>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="w-[50%] h-full bg-green-500 rounded-full" />
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-white border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                        View Report
                                    </button>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <FlaskConical className="w-4 h-4" /> Lab Environment
                                    </h4>
                                    {currentSession.hasLab ? (
                                        <>
                                            <p className="text-sm text-gray-500 mb-3">Linked Lab: <strong>Glocumal-Env-A1</strong></p>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Provision labs for all enrolled students? This may cost credits.")) return;
                                                    const { bulkProvisionBatchLabs } = await import("@/actions/labs");
                                                    alert("Starting Provisioning... Check console for progress.");
                                                    const res = await bulkProvisionBatchLabs(data.id, "aws-sandbox-v2");
                                                    if (res.success) alert(`Provisioned ${res.provisioned}/${res.total} labs.`);
                                                    else alert("Error: " + res.error);
                                                }}
                                                className="w-full py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                Unlock Labs
                                            </button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">No lab environment linked to this session.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl">
                            <p className="text-gray-500">No sessions found for this batch.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
