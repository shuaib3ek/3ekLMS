"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Users,
    GraduationCap,
    Calendar,
    ClipboardCheck
} from "lucide-react";

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-50 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="3ekLMS" className="h-8 w-auto" />
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1">
                    <NavItem href="/instructor" icon={LayoutDashboard}>Dashboard</NavItem>
                    <NavItem href="/instructor/batches" icon={Calendar}>Batches</NavItem>
                    <NavItem href="/instructor/courses" icon={BookOpen}>Programs</NavItem>
                    <NavItem href="/instructor/assessments" icon={ClipboardCheck}>Assessments</NavItem>
                    <NavItem href="/instructor/students" icon={Users}>Students</NavItem>
                    <NavItem href="/instructor/analytics" icon={BarChart3}>Analytics</NavItem>
                    <NavItem href="/instructor/settings" icon={Settings}>Settings</NavItem>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student View
                        </Link>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {/* Instructor Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="text-sm font-medium text-gray-500">
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

function NavItem({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? "bg-black text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
        >
            <Icon className="w-4 h-4" />
            {children}
        </Link>
    );
}
