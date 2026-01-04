"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { clsx } from "clsx";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Users,
    GraduationCap,
    Calendar,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell
} from "lucide-react";

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside
                className={clsx(
                    "bg-white border-r border-gray-200 fixed inset-y-0 z-50 flex flex-col transition-all duration-300",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="3ekLMS" className="h-8 w-auto" />
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ml-auto"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    <NavItem href="/instructor" icon={LayoutDashboard} collapsed={collapsed}>Dashboard</NavItem>
                    <NavItem href="/instructor/batches" icon={Calendar} collapsed={collapsed}>Batches</NavItem>
                    <NavItem href="/instructor/courses" icon={BookOpen} collapsed={collapsed}>Programs</NavItem>
                    <NavItem href="/instructor/assessments" icon={ClipboardCheck} collapsed={collapsed}>Assessments</NavItem>
                    <NavItem href="/instructor/students" icon={Users} collapsed={collapsed}>Students</NavItem>
                    <NavItem href="/instructor/analytics" icon={BarChart3} collapsed={collapsed}>Analytics</NavItem>
                    <NavItem href="/instructor/settings" icon={Settings} collapsed={collapsed}>Settings</NavItem>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link
                            href="/dashboard"
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200",
                                collapsed && "justify-center"
                            )}
                            title={collapsed ? "Student View" : ""}
                        >
                            <GraduationCap className="w-5 h-5 min-w-[20px]" />
                            {!collapsed && "Student View"}
                        </Link>
                    </div>
                </div>

                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all w-full",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? "Sign Out" : ""}
                    >
                        <LogOut className="w-5 h-5 min-w-[20px]" />
                        {!collapsed && "Sign Out"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={clsx(
                    "flex-1 min-h-screen transition-all duration-300",
                    collapsed ? "ml-20" : "ml-64"
                )}
            >
                {/* Instructor Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="text-sm font-medium text-gray-500 hidden sm:block">
                        San Francisco, CA • 9:41 AM
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">Sarah Chen</p>
                            <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                        <Link href="/instructor/settings">
                            <img
                                src="https://ui-avatars.com/api/?name=Sarah+Chen&background=000&color=fff"
                                alt="Sarah Chen"
                                className="w-10 h-10 rounded-full border-2 border-gray-100 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                        </Link>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, children, collapsed }: { href: string; icon: any; children: React.ReactNode, collapsed: boolean }) {
    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Link
            href={href}
            title={collapsed ? children?.toString() : ""}
            className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                    ? "bg-black text-white shadow-md shadow-gray-200"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
            )}
        >
            <Icon className="w-5 h-5 min-w-[20px]" />
            {!collapsed && <span>{children}</span>}
        </Link>
    );
}
