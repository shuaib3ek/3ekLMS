import { CheckCircle2, Server, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function SolutionsPage() {
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
                    {/* Header */}
                    <div className="max-w-3xl mb-24">
                        <h1 className="text-5xl font-bold tracking-tight mb-6">Enterprise-Grade Learning Solutions for Modern Teams.</h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Whether you need to upskill engineers, onboard new hires, or certify partners, 3ekLMS provides the infrastructure to deliver verifiable skills at scale.
                        </p>
                    </div>

                    {/* Solutions Grid */}
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                                <Server className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl font-bold">Tech Enablement</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Don't just watch videos. Provision live cloud environments for AWS, Python, Node.js, and more. Our <strong>Glocumal Labs integration</strong> ensures every developer proves their skills in a real IDE before getting certified.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Ephemeral Sandboxes
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Automated Code Grading
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Project-Based Assessments
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
                            {/* Visual Placeholder */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                                    <span className="font-bold text-sm">Lab Session #8421</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Running</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-gray-100 rounded w-3/4" />
                                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                                    <div className="h-32 bg-gray-900 rounded-lg mt-4 p-3 font-mono text-xs text-green-400">
                                        $ npm install<br />
                                        added 1 package in 0.4s<br />
                                        $ node server.js<br />
                                        Listening on port 3000...
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px] md:order-last">
                            {/* Visual Placeholder */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100" />
                                    <div>
                                        <div className="h-4 bg-gray-100 rounded w-24 mb-1" />
                                        <div className="h-3 bg-gray-50 rounded w-16" />
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-bold">Compliance Training: Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl font-bold">Compliance & Onboarding</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Ensure every employee is up to date with mandatory training. Track attendance in real-time for live workshops and automate recertification reminders.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Digital Signatures
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Audit Logs
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> SSO Integration
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-24 p-12 bg-black rounded-3xl text-white text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to transform your workforce?</h2>
                        <Link href="/" className="inline-flex px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
