"use client";

import { User, Mail, Shield, Smartphone, Globe, ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";

export default function StudentProfilePage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* Navbar Minimal */}
            <nav className="sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-6 h-16 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bold text-gray-900">Account Settings</h1>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Profile Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group cursor-pointer">
                        <img
                            src="https://ui-avatars.com/api/?name=Alex+Johnson&background=000&color=fff&size=128"
                            alt="Alex Johnson"
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Alex Johnson</h2>
                        <p className="text-gray-500 mb-6">Student • Joined October 2025</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">Full Stack Developer</span>
                            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">DevOps Enthusiast</span>
                        </div>
                    </div>

                    <button className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
                        Edit Profile
                    </button>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Personal Info */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5" /> Personal Information
                        </h3>
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-900">Alex Johnson</span>
                                    <button className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> alex.j@example.com</span>
                                    <button className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-900 flex items-center gap-2"><Smartphone className="w-4 h-4 text-gray-400" /> +1 (555) 000-0000</span>
                                    <button className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Add</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Security & Login
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-gray-900">Password</p>
                                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                </div>
                                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">Update</button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-green-600 font-medium">Enabled</p>
                                </div>
                                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">Manage</button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-gray-900">Active Sessions</p>
                                    <p className="text-sm text-gray-500">MacBook Pro • Seattle, WA</p>
                                </div>
                                <button className="text-red-500 text-sm font-bold hover:underline">Log out all</button>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Globe className="w-5 h-5" /> Language & Region</h3>
                            <p className="text-gray-400 max-w-md">Customize your learning experience. Valid certificates will be issued in your preferred language.</p>
                        </div>
                        <div className="flex gap-4">
                            <select className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:bg-white/20 option:text-black">
                                <option>English (US)</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>German</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
