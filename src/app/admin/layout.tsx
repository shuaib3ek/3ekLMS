"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    GraduationCap,
    Layers,
    BarChart3,
    FileVideo,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    BookOpen,
    UserPlus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user: currentUser, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Admin Sidebar */}
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
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    <div className="px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{!collapsed && "Management"}</div>
                    <NavItem href="/admin" icon={LayoutDashboard} collapsed={collapsed}>Overview</NavItem>

                    {/* Super Admin Only: Organizations */}
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <NavItem href="/admin/orgs" icon={Building2} collapsed={collapsed}>Organizations</NavItem>
                    )}

                    <NavItem href="/admin/batches" icon={Layers} collapsed={collapsed}>Batches</NavItem>

                    {/* Super Admin Only: Media */}
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <NavItem href="/admin/media" icon={FileVideo} collapsed={collapsed}>Media Library</NavItem>
                    )}

                    {/* Section Header: System (Super) or Insights (Org) */}
                    {currentUser?.role === 'SUPER_ADMIN' ? (
                        <div className="mt-6 px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{!collapsed && "System"}</div>
                    ) : (
                        <div className="mt-6 px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{!collapsed && "Insights & People"}</div>
                    )}

                    {/* Super Admin Only: Create User Shortcut */}
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <NavItem href="/admin/users/create" icon={UserPlus} collapsed={collapsed}>Create User</NavItem>
                    )}

                    <NavItem href="/admin/users" icon={Users} collapsed={collapsed}>
                        {currentUser?.role === 'SUPER_ADMIN' ? 'Global Users' : 'My Users'}
                    </NavItem>
                    <NavItem href="/admin/analytics" icon={BarChart3} collapsed={collapsed}>Analytics</NavItem>

                    {/* Super Admin Only: Platform Settings */}
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <NavItem href="/admin/settings" icon={Settings} collapsed={collapsed}>Platform Settings</NavItem>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link
                            href="/dashboard"
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200",
                                collapsed && "justify-center"
                            )}
                            title="Exit to Student App"
                        >
                            <GraduationCap className="w-5 h-5" />
                            {!collapsed && <span>Exit to App</span>}
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
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
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
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {/* Badge customized for Role */}
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${currentUser?.role === 'SUPER_ADMIN'
                                ? 'bg-black text-white'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                            {currentUser?.role === 'SUPER_ADMIN' ? 'ADMIN_CONSOLE' : 'GOVERNANCE_PORTAL'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 ring-2 ring-white shadow-sm" />
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
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
