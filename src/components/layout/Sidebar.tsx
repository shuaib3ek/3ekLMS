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
    GraduationCap,
    Presentation,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: BookOpen, label: "My Courses", href: "/dashboard/courses" },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments" },
    { icon: Terminal, label: "Lab Sandbox", href: "/dashboard/labs" },
    { icon: GraduationCap, label: "Certifications", href: "/dashboard/certs" },
];

const accountItems = [
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside
            className={clsx(
                "h-screen bg-gray-50/50 border-r border-gray-100 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100/50">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="3ekLMS" className="h-8 w-auto" />
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-500 transition-colors ml-auto"
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-8 px-3 space-y-8 overflow-y-auto overflow-x-hidden">
                {/* Main Menu */}
                <div>
                    {!collapsed && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Learning</p>}
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={collapsed ? item.label : ""}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "bg-black text-white shadow-lg shadow-gray-200"
                                            : "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm",
                                        collapsed && "justify-center"
                                    )}
                                >
                                    <Icon className="w-5 h-5 min-w-[20px]" />
                                    {!collapsed && item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Account Menu */}
                <div>
                    {!collapsed && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</p>}
                    <nav className="space-y-1">
                        {accountItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={collapsed ? item.label : ""}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "bg-black text-white shadow-lg shadow-gray-200"
                                            : "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm",
                                        collapsed && "justify-center"
                                    )}
                                >
                                    <Icon className="w-5 h-5 min-w-[20px]" />
                                    {!collapsed && item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                {/* Role Switcher */}
                <div>
                    <nav className="space-y-1">
                        <Link
                            href="/instructor"
                            title={collapsed ? "Instructor Mode" : ""}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all duration-200",
                                collapsed && "justify-center"
                            )}
                        >
                            <Presentation className="w-5 h-5 min-w-[20px]" />
                            {!collapsed && "Instructor Mode"}
                        </Link>
                    </nav>
                </div>
            </div>

            {/* User Profile / Logout */}
            <div className="p-3 border-t border-gray-100">
                <Link
                    href="/profile"
                    className={clsx(
                        "flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Profile" : ""}
                >
                    <img
                        src="https://ui-avatars.com/api/?name=Alex+Morgan&background=000&color=fff"
                        alt="Alex Morgan"
                        className="w-10 h-10 rounded-full bg-gray-200"
                    />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Alex Morgan</p>
                            <p className="text-xs text-gray-500 truncate">Student Account</p>
                        </div>
                    )}
                </Link>
                <button
                    onClick={logout}
                    className={clsx(
                        "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-600 transition-colors",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Sign Out" : ""}
                >
                    <LogOut className="w-5 h-5 min-w-[20px]" />
                    {!collapsed && "Sign Out"}
                </button>
            </div>
        </aside>
    );
}
