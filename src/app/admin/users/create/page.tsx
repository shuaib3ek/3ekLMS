"use client";

import { useState, useEffect } from "react";
import { User, Organization } from "@prisma/client";
import { UserPlus, Shield, Mail, Lock, User as UserIcon, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import { createUserAction, getAllOrgs } from "@/actions/lms";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ORG_ADMIN',
        orgId: ''
    });

    useEffect(() => {
        const loadOrgs = async () => {
            const data = await getAllOrgs();
            setOrgs(data);
            if (currentUser?.orgId) {
                setNewUserForm(prev => ({ ...prev, orgId: currentUser.orgId! }));
            } else if (data.length > 0) {
                setNewUserForm(prev => ({ ...prev, orgId: data[0].id }));
            }
        };
        loadOrgs();
    }, [currentUser?.orgId]);


    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUserForm.orgId) {
            alert("Error: Please select an Organization.");
            return;
        }

        setIsLoading(true);
        const res = await createUserAction({
            name: newUserForm.name,
            email: newUserForm.email,
            password: newUserForm.password,
            orgId: newUserForm.orgId,
            role: newUserForm.role as any
        });
        setIsLoading(false);

        if (res.success) {
            alert(`User created! Role: ${newUserForm.role}`);
            router.push('/admin/users');
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
                <p className="text-gray-500 mt-1">Add a new user to the organization system.</p>
            </div>

            <div className="max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Organization Selection */}
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Organization</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    required
                                    value={newUserForm.orgId}
                                    onChange={e => setNewUserForm({ ...newUserForm, orgId: e.target.value })}
                                    className="w-full pl-10 px-4 py-2 border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                >
                                    <option value="">Select Organization</option>
                                    {orgs.map(org => (
                                        <option key={org.id} value={org.id}>{org.name} ({org.domain || 'No Domain'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input required value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="John Doe" />
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full pl-10 px-4 py-2 border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-black/5 outline-none transition-all">
                                    <option value="ORG_ADMIN">Org Admin (Local Admin)</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input required type="password" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="••••••••" />
                                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : <><UserPlus className="w-4 h-4" /> Create User</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
