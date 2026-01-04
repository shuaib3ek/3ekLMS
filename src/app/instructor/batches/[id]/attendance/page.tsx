"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, Batch, User, Enrollment } from "@/lib/db";
import { ArrowLeft, Save, Check, X, Clock } from "lucide-react";

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export default function AttendancePage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [students, setStudents] = useState<{ user: User, status: AttendanceStatus }[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        db.init();

        // Load Batch
        const fetchedBatch = db.batches.getAll().find(b => b.id === batchId);
        if (fetchedBatch) {
            setBatch(fetchedBatch);

            // Load Enrollments & Users
            // In a real app, this would be a join query: SELECT * FROM enrollments JOIN users ...
            const enrollments = db.enrollments.getByBatch(batchId);
            const allUsers = db.users.getAll();

            const studentList = enrollments.map(enrollment => {
                const user = allUsers.find(u => u.id === enrollment.userId);
                return user ? { user, status: 'PRESENT' as AttendanceStatus } : null;
            }).filter(Boolean) as { user: User, status: AttendanceStatus }[];

            if (studentList.length === 0) {
                // Mock students for demo if none enrolled
                const mockStudents = [
                    { user: { id: 's1', name: "Alice Johnson", email: "alice@example.com", avatar: "https://ui-avatars.com/api/?name=Alice", role: "LEARNER", orgId: "default" }, status: 'PRESENT' },
                    { user: { id: 's2', name: "Bob Smith", email: "bob@example.com", avatar: "https://ui-avatars.com/api/?name=Bob", role: "LEARNER", orgId: "default" }, status: 'PRESENT' },
                    { user: { id: 's3', name: "Charlie Davis", email: "charlie@example.com", avatar: "https://ui-avatars.com/api/?name=Charlie", role: "LEARNER", orgId: "default" }, status: 'PRESENT' }
                ];
                setStudents(mockStudents as any);
            } else {
                setStudents(studentList);
            }
        }
    }, [batchId]);

    const handleStatusChange = (userId: string, status: AttendanceStatus) => {
        setStudents(prev => prev.map(s => s.user.id === userId ? { ...s, status } : s));
    };

    const handleSave = () => {
        // Here we would save to a new 'Attendance' table in db.ts
        // For now, we simulate success
        alert(`Attendance saved for ${date}`);
        router.back();
    };

    if (!batch) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                    <p className="text-gray-500">{batch.name}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-bold text-gray-700">Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        {students.filter(s => s.status === 'PRESENT').length} Present • {students.filter(s => s.status === 'ABSENT').length} Absent
                    </div>
                </div>

                <div className="space-y-2">
                    {students.map(({ user, status }) => (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <img src={user.avatar || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full bg-gray-200" alt="" />
                                <div>
                                    <p className="font-bold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => handleStatusChange(user.id, 'PRESENT')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${status === 'PRESENT' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Present
                                </button>
                                <button
                                    onClick={() => handleStatusChange(user.id, 'LATE')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${status === 'LATE' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Late
                                </button>
                                <button
                                    onClick={() => handleStatusChange(user.id, 'ABSENT')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${status === 'ABSENT' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Absent
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button onClick={handleSave} className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg">
                        <Save className="w-4 h-4" /> Save Record
                    </button>
                </div>
            </div>
        </div>
    );
}
