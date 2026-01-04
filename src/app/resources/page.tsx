import { FileText, Video, Mic, Download } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Nav (Simplified Reuse) */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="3ekLMS" className="h-8 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black">Log in</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl font-bold mb-4">Resources & Insights</h1>
                        <p className="text-xl text-gray-500">Expert guides, whitepapers, and case studies on L&D strategy.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Featured Resource */}
                        <div className="md:col-span-2 bg-gray-50 rounded-3xl p-8 border border-gray-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Whitepaper</span>
                                <h2 className="text-3xl font-bold mb-4 group-hover:underline decoration-2 underline-offset-4">The State of Technical Training 2026</h2>
                                <p className="text-gray-600 text-lg mb-8 max-w-lg">
                                    How F500 companies are shifting from passive video consumption to active, lab-based skills verification.
                                    Based on survey data from 500+ CTOs.
                                </p>
                                <button className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                                    <Download className="w-4 h-4" /> Download Report
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 h-full w-1/3 bg-blue-500/10 skew-x-12 translate-x-12" />
                        </div>

                        {/* Recent Articles */}
                        <div className="space-y-6">
                            {[
                                { title: "Building an Internal Academy from Scratch", type: "Guide" },
                                { title: "ROI of LMS: Measuring what matters", type: "Article" },
                                { title: "Why your developers hate your current LMS", type: "Opinion" }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl border border-gray-200 hover:border-black hover:shadow-lg transition-all cursor-pointer bg-white">
                                    <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">{item.type}</span>
                                    <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-24">
                        <h2 className="text-2xl font-bold mb-8">Video Library</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="aspect-video bg-gray-100 rounded-2xl mb-4 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Video className="w-5 h-5 text-black" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900">Platform Walkthrough Part {i + 1}</h3>
                                    <p className="text-sm text-gray-500">5 min watch</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
