"use client";

import { useEffect, useState } from "react";
import { User, Organization } from "@prisma/client";
import { Search, Pencil, Trash2, X, Shield, Mail, User as UserIcon, Lock, Plus } from "lucide-react";
import { getAllUsers, getAllOrgs, updateUserAction, deleteUserAction, createUserAction } from "@/actions/lms";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type UserDTO = Omit<User, 'createdAt'> & { name: string; createdAt: string, avatar?: string };

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [orgs, setOrgs] = useState<Organization[]>([]);

    // Edit State
    const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'LEARNER' });

    // Create State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'LEARNER', orgId: '', password: 'password123' });

    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        if (!currentUser) return;
        try {
            // Super Admin sees ALL users. Org Admin sees only their Org users.
            const targetOrgId = currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.orgId;
            const uData = await getAllUsers(targetOrgId);
            setUsers(uData as unknown as UserDTO[]);
            const oData = await getAllOrgs();
            setOrgs(oData);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await createUserAction({
            name: createForm.name,
            email: createForm.email,
            role: createForm.role as any,
            orgId: createForm.orgId,
            password: createForm.password
        });
        setIsLoading(false);
        if (res.success) {
            setIsCreateModalOpen(false);
            setCreateForm({ name: '', email: '', role: 'LEARNER', orgId: '', password: 'password123' });
            fetchData();
        } else {
            alert(res.error);
        }
    };

    const handleEditClick = (user: UserDTO) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role
        });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsLoading(true);

        const res = await updateUserAction({
            id: editingUser.id,
            name: editForm.name,
            email: editForm.email,
            role: editForm.role as any
        });

        setIsLoading(false);
        if (res.success) {
            setEditingUser(null);
            fetchData(); // Refresh list
        } else {
            alert(res.error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        const res = await deleteUserAction(id);
        if (res.success) {
            fetchData();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {/* Header with Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage users, roles, and organizations.</p>
                </div>
                {currentUser?.role === 'SUPER_ADMIN' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Create User
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No users found.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'ORG_ADMIN' ? 'bg-orange-100 text-orange-700' :
                                                user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {orgs.find(o => o.id === user.orgId)?.name || user.orgId}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* RBAC: Hide actions for non-Super Admin */}
                                        {currentUser?.role === 'SUPER_ADMIN' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Edit User</h2>
                            <button onClick={() => setEditingUser(null)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Name</label>
                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Email</label>
                                <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Role</label>
                                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="LEARNER">Learner</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                    <option value="ORG_ADMIN">Org Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <button disabled={isLoading} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Create User</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Name</label>
                                <input required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Email</label>
                                <input required type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <input required type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Role</label>
                                <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="LEARNER">Learner</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                    <option value="ORG_ADMIN">Org Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Organization</label>
                                <select required value={createForm.orgId} onChange={e => setCreateForm({ ...createForm, orgId: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="">Select Organization</option>
                                    {orgs.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button disabled={isLoading} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800">
                                {isLoading ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
