"use client";

import { Save, Lock, Globe, Mail } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        platformName: "3ek Enterprise Learning",
        contactEmail: "admin@3ek.in",
        allowPublicSignup: false,
        maintenanceMode: false
    });

    const handleChange = (field: string, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        alert("Platform settings updated successfully.");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-gray-500 mt-1">Global configuration for the entire LMS instance.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
                {/* General Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" /> General Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Platform Name</label>
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={e => handleChange('platformName', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={e => handleChange('contactEmail', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Security */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" /> Access Control
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p className="font-bold text-gray-900">Allow Public Signups</p>
                            <p className="text-sm text-gray-500">If disabled, only Admins can create new users.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.allowPublicSignup}
                                onChange={e => handleChange('allowPublicSignup', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p className="font-bold text-gray-900">Maintenance Mode</p>
                            <p className="text-sm text-gray-500">Disable platform access for all non-admin users.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={e => handleChange('maintenanceMode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
