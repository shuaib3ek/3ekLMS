"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Terminal,
    Users,
    Settings,
    LogOut,
    GraduationCap
} from "lucide-react";
import { clsx } from "clsx";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: BookOpen, label: "My Courses", href: "/dashboard/courses" },
    { icon: Terminal, label: "Lab Sandbox", href: "/dashboard/labs" },
    { icon: GraduationCap, label: "Certifications", href: "/dashboard/certs" },
];

const adminItems = [
    { icon: Users, label: "Team Management", href: "/dashboard/team" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-gray-50/50 border-r border-gray-100 flex flex-col fixed left-0 top-0">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-gray-100/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        3
                    </div>
                    <span className="font-bold text-lg tracking-tight text-gray-900">3ekLMS</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-8 px-4 space-y-8">
                {/* Main Menu */}
                <div>
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Learning</p>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "bg-black text-white shadow-lg shadow-gray-200"
                                            : "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Admin Menu */}
                <div>
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Workspace</p>
                    <nav className="space-y-1">
                        {adminItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "bg-black text-white shadow-lg shadow-gray-200"
                                            : "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
