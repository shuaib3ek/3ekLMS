"use client";

import { useState } from "react";
import { User, Lock, Bell, CreditCard, Save } from "lucide-react";

export default function InstructorSettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "account", label: "Password", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "billing", label: "Billing", icon: CreditCard },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account preferences and public profile.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                    ? "bg-black text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Public Profile</h2>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                                    SC
                                </div>
                                <div className="space-y-2">
                                    <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
                                        Upload New Picture
                                    </button>
                                    <button className="block text-sm text-red-600 font-medium hover:underline">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" defaultValue="Sarah" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" defaultValue="Connors" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Headline</label>
                                    <input type="text" defaultValue="Senior Cloud Architect & DevOps Instructor" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Bio</label>
                                    <textarea rows={4} defaultValue="Sarah is a cloud solutions architect with over 10 years of experience..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none resize-none" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Email Notifications</h2>
                            <div className="space-y-4">
                                {["New student enrollment", "Course completion alerts", "Daily revenue summary", "Student questions & comments"].map((setting, i) => (
                                    <div key={i} className="flex items-center justify-between py-2">
                                        <span className="text-gray-700 font-medium">{setting}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
                            <p className="text-gray-500 mb-6">Manage how you receive payouts.</p>
                            <button className="text-blue-600 font-bold hover:underline">Connect Stripe Account</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
