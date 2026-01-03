"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";

export function Header() {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">

            {/* Search Bar - Minimalist Pill */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses, labs, or documents..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all duration-300"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                <Link href="/profile" className="flex items-center gap-3 pl-6 border-l border-gray-100 hover:opacity-70 transition-opacity">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">Alex Morgan</p>
                        <p className="text-xs text-gray-500">DevOps Engineer</p>
                    </div>
                    <img
                        src="https://ui-avatars.com/api/?name=Alex+Morgan&background=000&color=fff"
                        alt="Alex Morgan"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                    />
                </Link>
            </div>
        </header>
    );
}
