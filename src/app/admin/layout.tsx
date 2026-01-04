"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    GraduationCap,
    Layers,
    BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 fixed inset-y-0 z-50 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="3ekLMS" className="h-8 w-auto brightness-0 invert" />
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1">
                    <NavItem href="/admin" icon={LayoutDashboard}>Overview</NavItem>
                    <NavItem href="/admin/users" icon={Users}>User Management</NavItem>
                    <NavItem href="/admin/orgs" icon={Building2}>Organizations</NavItem>
                    <NavItem href="/admin/programs" icon={Layers}>Program Catalog</NavItem>
                    <NavItem href="/admin/analytics" icon={BarChart3}>System Analytics</NavItem>
                    <NavItem href="/admin/settings" icon={Settings}>Platform Settings</NavItem>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Exit to App
                        </Link>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold">SYSTEM_ADMIN</span>
                        <span>v2.4.0-enterprise</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
        >
            <Icon className="w-4 h-4" />
            {children}
        </Link>
    );
}
