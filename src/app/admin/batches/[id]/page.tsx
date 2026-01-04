"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Users, Calendar, Clock, BookOpen, Plus,
    MoreHorizontal, ArrowLeft, Mail, Search,
    FlaskConical, ClipboardCheck, Edit, Upload, CheckSquare, AlertTriangle, ShieldCheck
} from "lucide-react";
import { getBatchDetails, enrollUserToBatchAction, updateBatchAction, bulkEnrollUsersAction, getAllUsers } from "@/actions/lms";
import { useAuth } from "@/context/AuthContext";
import { Role, TrainingType } from "@prisma/client";

// Define local types to withstand Prisma regeneration lag
type BatchDetailDTO = {
    id: string;
    orgId: string; // Added orgId to type
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    schedule: string | null;
    trainingEnabled: boolean;
    labEnabled: boolean;
    assessmentEnabled: boolean;
    trainingConfig: any;
    labConfig: any;
    assessmentConfig: any;
    owner?: { id: string; name: string }; // Added owner
    students: {
        id: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar?: string;
        };
        status: string;
        enrolledAt: string;
    }[];
};

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [batch, setBatch] = useState<BatchDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Assign Owner State
    const [orgUsers, setOrgUsers] = useState<{ id: string; name: string; email: string }[]>([]);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: '', startDate: '', endDate: '',
        trainingEnabled: false, labEnabled: false, assessmentEnabled: false,
        type: 'INSTRUCTOR_LED', schedule: '', ownerId: ''
    });
    const [trainingConfig, setTrainingConfig] = useState<any>({ days: [], startTime: '', endTime: '' });
    const [labConfig, setLabConfig] = useState<any>({ mode: 'FIXED' });
    const [assessmentConfig, setAssessmentConfig] = useState<any>({});
    const [bulkData, setBulkData] = useState('');

    // Add User Form
    const [userForm, setUserForm] = useState({
        name: '',
        email: ''
    });

    const fetchBatch = async () => {
        if (!params.id) return;
        try {
            const data = await getBatchDetails(params.id as string);
            setBatch(data as unknown as BatchDetailDTO);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatch();
    }, [params.id]);

    // Populate Edit Form and Fetch Users
    const openEditModal = async () => {
        if (!batch) return;
        setEditForm({
            name: batch.name,
            startDate: new Date(batch.startDate).toISOString().split('T')[0],
            endDate: new Date(batch.endDate).toISOString().split('T')[0],
            trainingEnabled: batch.trainingEnabled,
            labEnabled: batch.labEnabled,
            assessmentEnabled: batch.assessmentEnabled,
            type: batch.type,
            schedule: batch.schedule || '',
            ownerId: batch.owner?.id || ''
        });

        // Configs (Safe Defaults)
        setTrainingConfig(batch.trainingConfig || { days: ["Mon", "Fri"], startTime: '10:00', endTime: '12:00' });
        setLabConfig(batch.labConfig || { mode: 'FIXED', start: '09:00', end: '17:00' });
        setAssessmentConfig(batch.assessmentConfig || {});

        setIsEditModalOpen(true);

        // Load Org Users for Owner Selection
        if (orgUsers.length === 0 && batch.orgId) {
            const users = await getAllUsers(batch.orgId);
            setOrgUsers(users);
        }
    };

    const toggleDay = (day: string) => {
        setTrainingConfig((prev: any) => {
            const days = prev.days || [];
            if (days.includes(day)) return { ...prev, days: days.filter((d: string) => d !== day) };
            return { ...prev, days: [...days, day] };
        });
    };

    const handleBulkImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !batch) return;

        const lines = bulkData.split('\n').filter(l => l.trim());
        const users = lines.map(l => {
            const [email, name] = l.split(',').map(s => s.trim());
            return { email, name: name || email.split('@')[0] };
        }).filter(u => u.email);

        if (users.length === 0) return alert("No valid data found.");

        const res = await bulkEnrollUsersAction({
            batchId: batch.id,
            orgId: currentUser.orgId,
            users
        });

        if (res.success) {
            setIsBulkModalOpen(false);
            setBulkData('');
            await fetchBatch();
            alert(`Bulk Import Complete!\nSuccess: ${res?.stats?.success}\nNew Users: ${res?.stats?.newUsers}\nFailed: ${res?.stats?.failed}`);
        } else {
            alert(res.error);
        }
    };

    const handleUpdateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !batch) return;

        const finalTrainingConfig = editForm.trainingEnabled ? {
            days: trainingConfig.days, startTime: trainingConfig.startTime, endTime: trainingConfig.endTime
        } : undefined;

        let finalLabConfig = undefined;
        if (editForm.labEnabled) {
            finalLabConfig = { mode: labConfig.mode };
            if (labConfig.mode === 'FIXED') Object.assign(finalLabConfig, { start: labConfig.start, end: labConfig.end });
            else if (labConfig.mode === 'QUOTA') Object.assign(finalLabConfig, { quotaHours: labConfig.quotaHours });
            else if (labConfig.mode === 'DATE_RANGE') Object.assign(finalLabConfig, { startDate: labConfig.startDate, endDate: labConfig.endDate });
        }

        let finalAssessmentConfig = undefined;
        if (editForm.assessmentEnabled && !editForm.trainingEnabled) {
            finalAssessmentConfig = { startDate: assessmentConfig.startDate, endDate: assessmentConfig.endDate };
        }

        let scheduleSummary = editForm.schedule;
        if (editForm.trainingEnabled) {
            const days = trainingConfig.days || [];
            const dayStr = days.length === 5 && days.includes("Mon") && days.includes("Fri") ? "Mon-Fri" : days.join(",");
            scheduleSummary = `${dayStr} ${trainingConfig.startTime}-${trainingConfig.endTime}`;
        }

        const res = await updateBatchAction({
            id: batch.id,
            orgId: currentUser.orgId,
            name: editForm.name,
            startDate: editForm.startDate,
            endDate: editForm.endDate,
            type: editForm.type as TrainingType,
            trainingEnabled: editForm.trainingEnabled,
            labEnabled: editForm.labEnabled,
            assessmentEnabled: editForm.assessmentEnabled,
            schedule: scheduleSummary,
            trainingConfig: finalTrainingConfig,
            labConfig: finalLabConfig,
            assessmentConfig: finalAssessmentConfig,
            ownerId: editForm.ownerId
        });

        if (res.success) {
            setIsEditModalOpen(false);
            await fetchBatch();
            alert("Batch updated successfully!");
        } else {
            alert(res.error);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!process.env.NEXT_PUBLIC_API_URL && !currentUser) return; // minimal check

        const res = await enrollUserToBatchAction({
            name: userForm.name,
            email: userForm.email,
            batchId: batch!.id,
            orgId: currentUser!.orgId,
            role: 'LEARNER' as Role
        });

        if (res.success) {
            setIsAddUserModalOpen(false);
            setUserForm({ name: '', email: '' });
            await fetchBatch();
            if (res.isNewUser) {
                alert("✅ New User created and enrolled!");
            } else {
                alert("🔁 Existing User found. Batch access added to their profile.");
            }
        } else {
            alert(res.error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading batch details...</div>;
    if (!batch) return <div className="p-8 text-center">Batch not found.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Batches
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                                {batch.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> {batch.type}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                            </span>
                            {batch.owner && (
                                <span className="flex items-center gap-2 font-bold text-black" title="Batch Owner">
                                    <ShieldCheck className="w-4 h-4" /> {batch.owner.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* Action Buttons: Super Admin Only */}
                        {currentUser?.role === 'SUPER_ADMIN' && (
                            <>
                                <button onClick={openEditModal} className="px-4 py-2 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Edit className="w-4 h-4" /> Edit Batch
                                </button>
                                <button onClick={() => setIsBulkModalOpen(true)} className="px-4 py-2 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> Bulk Upload
                                </button>
                                <button
                                    onClick={() => setIsAddUserModalOpen(true)}
                                    className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add User
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs area - For MVP just showing User List */}
            <div className="grid grid-cols-3 gap-8">
                {/* Main Content: User List */}
                <div className="col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5" /> Enrolled Learners ({batch.students.length})
                        </h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                                placeholder="Search learners..."
                            />
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4">Access</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {batch.students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        No learners enrolled yet. Click "Add User" to enroll someone.
                                    </td>
                                </tr>
                            ) : (
                                batch.students.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{enrollment.user.name}</div>
                                            {enrollment.user.id === batch.owner?.id && <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded ml-2">OWNER</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {enrollment.user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Fake Progress for UI */}
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[10%]"></div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 block">10%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {batch.labEnabled && <FlaskConical className="w-4 h-4 text-blue-500" />}
                                                {batch.assessmentEnabled && <ClipboardCheck className="w-4 h-4 text-purple-500" />}
                                                {!batch.labEnabled && !batch.assessmentEnabled && <span className="text-xs text-gray-400">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal ... (Same as before) */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2">Enroll Learner</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="jane@company.com" />
                            </div>
                            <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Enroll & Notify</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal ... (Same as before) */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Upload className="w-5 h-5" /> Bulk Import Users</h2>
                        <form onSubmit={handleBulkImport} className="space-y-4">
                            <textarea required value={bulkData} onChange={e => setBulkData(e.target.value)} className="w-full h-64 px-4 py-4 border rounded-lg font-mono text-sm bg-gray-50" placeholder="jane@example.com, Jane Doe" />
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg font-bold">Import Users</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Batch Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-0 w-full max-w-3xl shadow-2xl h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-bold">Edit Batch Configuration</h2>
                            <button onClick={() => setIsEditModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateBatch} className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* 1. Basic Info */}
                            <section className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Batch Name</label>
                                    <input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                </div>

                                {/* Owner Selection */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Batch Owner (Lead)</label>
                                    <select value={editForm.ownerId} onChange={e => setEditForm({ ...editForm, ownerId: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white">
                                        <option value="">-- Assign Owner --</option>
                                        {orgUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Assign a user (learner or instructor) as the Batch Owner.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                    <input type="date" required value={editForm.startDate} onChange={e => setEditForm({ ...editForm, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                    <input type="date" required value={editForm.endDate} onChange={e => setEditForm({ ...editForm, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                            </section>

                            {/* 2. Feature Selection */}
                            <section>
                                <h3 className="text-sm font-bold uppercase mb-4">Features</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <label className={`p-4 border rounded-xl cursor-pointer ${editForm.trainingEnabled ? 'border-orange-500 bg-orange-50' : ''}`}>
                                        <div className="flex justify-between"><span className="font-bold">Training</span><input type="checkbox" checked={editForm.trainingEnabled} onChange={e => setEditForm({ ...editForm, trainingEnabled: e.target.checked })} /></div>
                                    </label>
                                    <label className={`p-4 border rounded-xl cursor-pointer ${editForm.labEnabled ? 'border-blue-500 bg-blue-50' : ''}`}>
                                        <div className="flex justify-between"><span className="font-bold">Labs</span><input type="checkbox" checked={editForm.labEnabled} onChange={e => setEditForm({ ...editForm, labEnabled: e.target.checked })} /></div>
                                    </label>
                                    <label className={`p-4 border rounded-xl cursor-pointer ${editForm.assessmentEnabled ? 'border-purple-500 bg-purple-50' : ''}`}>
                                        <div className="flex justify-between"><span className="font-bold">Assessments</span><input type="checkbox" checked={editForm.assessmentEnabled} onChange={e => setEditForm({ ...editForm, assessmentEnabled: e.target.checked })} /></div>
                                    </label>
                                </div>
                            </section>

                            {/* 3. Training Config ... */}
                            {editForm.trainingEnabled && (
                                <section className="p-6 bg-orange-50 border border-orange-100 rounded-xl">
                                    <h3 className="font-bold text-orange-900 mb-4">Schedule</h3>
                                    <div className="flex gap-2 mb-4">
                                        {DAYS_OF_WEEK.map(day => (
                                            <button type="button" key={day} onClick={() => toggleDay(day)} className={`w-10 h-10 rounded-lg font-bold text-sm ${trainingConfig.days?.includes(day) ? 'bg-orange-600 text-white' : 'bg-white border'}`}>{day.charAt(0)}</button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="time" value={trainingConfig.startTime} onChange={e => setTrainingConfig({ ...trainingConfig, startTime: e.target.value })} className="border rounded-lg px-3 py-2" />
                                        <input type="time" value={trainingConfig.endTime} onChange={e => setTrainingConfig({ ...trainingConfig, endTime: e.target.value })} className="border rounded-lg px-3 py-2" />
                                    </div>
                                </section>
                            )}

                            {/* 4. Lab Config ... */}
                            {editForm.labEnabled && (
                                <section className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
                                    <h3 className="font-bold text-blue-900 mb-4">Lab Access</h3>
                                    <div className="flex gap-4 mb-4">
                                        {['FIXED', 'QUOTA', 'DATE_RANGE'].map(m => (
                                            <label key={m} className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                                <input type="radio" checked={labConfig.mode === m} onChange={() => setLabConfig({ ...labConfig, mode: m })} /> {m}
                                            </label>
                                        ))}
                                    </div>
                                    {labConfig.mode === 'FIXED' && <div className="grid grid-cols-2 gap-4"><input type="time" value={labConfig.start} onChange={e => setLabConfig({ ...labConfig, start: e.target.value })} className="border rounded-lg px-3 py-2" /><input type="time" value={labConfig.end} onChange={e => setLabConfig({ ...labConfig, end: e.target.value })} className="border rounded-lg px-3 py-2" /></div>}
                                    {labConfig.mode === 'QUOTA' && <input type="number" value={labConfig.quotaHours} onChange={e => setLabConfig({ ...labConfig, quotaHours: parseInt(e.target.value) })} className="border rounded-lg px-3 py-2 w-full" placeholder="Hours" />}
                                    {labConfig.mode === 'DATE_RANGE' && <div className="grid grid-cols-2 gap-4"><input type="date" value={labConfig.startDate} onChange={e => setLabConfig({ ...labConfig, startDate: e.target.value })} className="border rounded-lg px-3 py-2" /><input type="date" value={labConfig.endDate} onChange={e => setLabConfig({ ...labConfig, endDate: e.target.value })} className="border rounded-lg px-3 py-2" /></div>}
                                </section>
                            )}
                        </form>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold">Cancel</button>
                            <button onClick={handleUpdateBatch} className="px-6 py-2 bg-black text-white rounded-lg font-bold">Update Batch</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
