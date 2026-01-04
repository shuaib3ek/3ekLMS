"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, MoreHorizontal, Layers, Calendar, Users, FlaskConical, ClipboardCheck, BookOpen, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import { getAllBatches, createBatchAction, getAllOrgs } from "@/actions/lms";
import { useAuth } from "@/context/AuthContext";
import { TrainingType, Organization } from "@prisma/client";

type BatchDTO = {
    id: string;
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    trainingEnabled: boolean;
    labEnabled: boolean;
    assessmentEnabled: boolean;
    _count: { students: number };
};

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminBatchesPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [batches, setBatches] = useState<BatchDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orgs, setOrgs] = useState<Organization[]>([]);

    // Core Form State
    const [formData, setFormData] = useState({
        name: '',
        orgId: '', // Added for Super Admin selection
        startDate: '',
        endDate: '',
        trainingEnabled: true,
        labEnabled: false,
        assessmentEnabled: false,
        type: 'INSTRUCTOR_LED' as TrainingType | string, // Kept dynamic for form
        schedule: '' // Legacy summary
    });

    // Detailed Config States
    const [trainingConfig, setTrainingConfig] = useState({
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: '10:00',
        endTime: '13:00'
    });

    const [labConfig, setLabConfig] = useState({
        mode: 'FIXED', // FIXED, QUOTA, DATE_RANGE
        start: '09:00',
        end: '18:00',
        quotaHours: 20,
        startDate: '',
        endDate: ''
    });

    const [assessmentConfig, setAssessmentConfig] = useState({
        startDate: '',
        endDate: ''
    });

    const fetchBatches = async () => {
        if (!currentUser) return;
        try {
            const targetOrgId = currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.orgId;
            const data = await getAllBatches(targetOrgId);
            setBatches(data as unknown as BatchDTO[]);

            if (currentUser.role === 'SUPER_ADMIN') {
                const orgData = await getAllOrgs();
                setOrgs(orgData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [currentUser]);

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Target Org: Selected (Super Admin) or Current (Org Admin - if they had permission, but they don't now)
        // Verify RBAC logic: Only Super Admin can persist.
        // But for robust code, we prioritize selected orgId.
        const targetOrgId = formData.orgId || currentUser?.orgId;

        if (!targetOrgId) {
            alert("Organization is required.");
            return;
        }

        // Construct Payloads
        const finalTrainingConfig = formData.trainingEnabled ? {
            days: trainingConfig.days,
            startTime: trainingConfig.startTime,
            endTime: trainingConfig.endTime
        } : undefined;

        let finalLabConfig = undefined;
        if (formData.labEnabled) {
            finalLabConfig = { mode: labConfig.mode };
            if (labConfig.mode === 'FIXED') {
                Object.assign(finalLabConfig, { start: labConfig.start, end: labConfig.end });
            } else if (labConfig.mode === 'QUOTA') {
                Object.assign(finalLabConfig, { quotaHours: labConfig.quotaHours });
            } else if (labConfig.mode === 'DATE_RANGE') {
                Object.assign(finalLabConfig, { startDate: labConfig.startDate, endDate: labConfig.endDate });
            }
        }

        const res = await createBatchAction({
            name: formData.name,
            orgId: targetOrgId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            type: formData.type as TrainingType,
            trainingEnabled: formData.trainingEnabled,
            labEnabled: formData.labEnabled,
            assessmentEnabled: formData.assessmentEnabled,
            schedule: formData.trainingEnabled ? `${trainingConfig.days.length} days/week` : 'Flexible',
            trainingConfig: finalTrainingConfig,
            labConfig: finalLabConfig,
            assessmentConfig: formData.assessmentEnabled ? assessmentConfig : undefined
        });

        if (res.success) {
            setIsModalOpen(false);
            fetchBatches();
            // Reset form (simplified)
            setFormData({ ...formData, name: '', startDate: '', endDate: '' });
        } else {
            alert(res.error);
        }
    };

    const toggleDay = (day: string) => {
        setTrainingConfig(prev => {
            if (prev.days.includes(day)) return { ...prev, days: prev.days.filter(d => d !== day) };
            return { ...prev, days: [...prev.days, day] };
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
                    <p className="text-gray-500 mt-1">Manage training deliveries using the checkbox-driven model.</p>
                </div>
                {/* RBAC: Create Button only for Super Admin */}
                {currentUser?.role === 'SUPER_ADMIN' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Create Batch
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search batches..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Batch Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4">Students</th>
                            <th className="px-6 py-4">Features</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {batches.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No batches found.</td></tr>
                        ) : (
                            batches.map((batch) => (
                                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <Link href={`/admin/batches/${batch.id}`} className="block group">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{batch.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {batch.trainingEnabled
                                                            ? (batch.type === 'INSTRUCTOR_LED' ? 'Instructor-Led' : batch.type === 'SELF_PACED' ? 'Self-Paced' : 'Hybrid')
                                                            : (batch.labEnabled ? 'Lab-Only' : 'Assessment-Only')
                                                        }
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(batch.startDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3" />
                                            {batch._count.students} Users
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {batch.trainingEnabled && (
                                                <span title="Training Included">
                                                    <BookOpen className="w-4 h-4 text-gray-700" />
                                                </span>
                                            )}
                                            {batch.labEnabled && (
                                                <span title="Labs Included">
                                                    <FlaskConical className="w-4 h-4 text-blue-500" />
                                                </span>
                                            )}
                                            {batch.assessmentEnabled && (
                                                <span title="Assessments Included">
                                                    <ClipboardCheck className="w-4 h-4 text-purple-500" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* RBAC: Hide Actions for Org Admin */}
                                        {currentUser?.role === 'SUPER_ADMIN' && (
                                            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Batch Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-0 w-full max-w-3xl shadow-2xl h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Create New Batch</h2>
                                <p className="text-sm text-gray-500">Define Time Governance & Access Control</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form id="create-batch-form" onSubmit={handleCreateBatch} className="flex-1 overflow-y-auto p-8 space-y-8">

                            {/* 1. Basic Info */}
                            <section className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Batch Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="e.g., Full Stack Java - Feb 2026"
                                    />
                                </div>

                                {/* Organization Selection for Super Admin */}
                                {currentUser?.role === 'SUPER_ADMIN' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Organization</label>
                                        <select
                                            required
                                            value={formData.orgId}
                                            onChange={e => setFormData({ ...formData, orgId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        >
                                            <option value="">Select Organization</option>
                                            {orgs.map(o => (
                                                <option key={o.id} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </section>

                            {/* 2. Feature Toggles */}
                            <section className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-gray-600" />
                                    Enable Features
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.trainingEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.trainingEnabled}
                                            onChange={e => setFormData({ ...formData, trainingEnabled: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">Training</p>
                                            <p className="text-xs text-gray-500">Instructor-led or Hybrid</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.labEnabled ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.labEnabled}
                                            onChange={e => setFormData({ ...formData, labEnabled: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">Labs</p>
                                            <p className="text-xs text-gray-500">Virtual Environment Access</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.assessmentEnabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.assessmentEnabled}
                                            onChange={e => setFormData({ ...formData, assessmentEnabled: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">Assessments</p>
                                            <p className="text-xs text-gray-500">Quizzes & Projects</p>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            {/* 3. Detailed Governance (Conditional) */}
                            {formData.trainingEnabled && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-700">
                                        <Clock className="w-5 h-5" />
                                        Training Schedule
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Days of Week</label>
                                            <div className="flex gap-2">
                                                {DAYS_OF_WEEK.map(day => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleDay(day)}
                                                        className={`px-3 py-1 text-sm rounded-full font-bold transition-all ${trainingConfig.days.includes(day)
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                                                <input type="time" value={trainingConfig.startTime} onChange={e => setTrainingConfig({ ...trainingConfig, startTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                                                <input type="time" value={trainingConfig.endTime} onChange={e => setTrainingConfig({ ...trainingConfig, endTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {formData.labEnabled && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-700">
                                        <FlaskConical className="w-5 h-5" />
                                        Lab Access Control
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Access Mode</label>
                                            <select
                                                value={labConfig.mode}
                                                onChange={e => setLabConfig({ ...labConfig, mode: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            >
                                                <option value="FIXED">Fixed Hours (Strict)</option>
                                                <option value="QUOTA">Quota Based (Flexi)</option>
                                                <option value="DATE_RANGE">24x7 Date Range</option>
                                            </select>
                                        </div>
                                        {labConfig.mode === 'FIXED' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 text-xs text-gray-500 bg-orange-50 p-2 rounded">
                                                    Students can only access labs between these hours daily.
                                                </div>
                                                <input type="time" value={labConfig.start} onChange={e => setLabConfig({ ...labConfig, start: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                                <input type="time" value={labConfig.end} onChange={e => setLabConfig({ ...labConfig, end: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                            </div>
                                        )}
                                        {labConfig.mode === 'QUOTA' && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Total Hours Allowed</label>
                                                <input type="number" value={labConfig.quotaHours} onChange={e => setLabConfig({ ...labConfig, quotaHours: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" />
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {formData.assessmentEnabled && (
                                <section>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-purple-700">
                                        <ClipboardCheck className="w-5 h-5" />
                                        Assessment Governance
                                    </h3>
                                    {formData.trainingEnabled ? (
                                        <div className="bg-purple-50 p-4 rounded-lg flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-purple-900">Trainer Managed</p>
                                                <p className="text-sm text-purple-700">Since Training is enabled, assessments will be scheduled by the Instructor during the batch.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Window Start</label>
                                                <input type="datetime-local" value={assessmentConfig.startDate} onChange={e => setAssessmentConfig({ ...assessmentConfig, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Window End</label>
                                                <input type="datetime-local" value={assessmentConfig.endDate} onChange={e => setAssessmentConfig({ ...assessmentConfig, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                        </form>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 hover:text-gray-900 font-bold">Cancel</button>
                            <button
                                type="submit"
                                form="create-batch-form"
                                className="px-8 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Publish Batch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
