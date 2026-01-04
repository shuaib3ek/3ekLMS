"use client";

import { useEffect, useState } from "react";
import { Organization } from "@prisma/client";
import { Search, Plus, MoreHorizontal, Building2 } from "lucide-react";
import { getAllOrgs, createOrgAction } from "@/actions/lms";

export default function AdminOrgsPage() {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', domain: '' });

    const fetchOrgs = async () => {
        try {
            const data = await getAllOrgs();
            setOrgs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔄 Creating organization...', formData);

        const res = await createOrgAction({
            name: formData.name,
            domain: formData.domain || undefined
        });

        console.log('✅ Server response:', res);

        if (res.success) {
            setIsModalOpen(false);
            setFormData({ name: '', domain: '' });
            await fetchOrgs(); // Refresh list
            alert("Organization created successfully!");
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-gray-500 mt-1">Manage tenant organizations.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Add Organization
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Domain</th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : orgs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No organizations found.</td></tr>
                        ) : (
                            orgs.map((org) => (
                                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{org.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {org.domain || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                        {org.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(org.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Create New Organization</h2>
                        <form onSubmit={handleCreateOrg} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Organization Name</label>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Acme Corporation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Domain (Optional)</label>
                                <input
                                    name="domain"
                                    type="text"
                                    value={formData.domain}
                                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., acme.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">Used for auto-detection and organization identification</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Create Organization
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
