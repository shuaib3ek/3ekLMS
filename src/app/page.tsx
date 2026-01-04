"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, PlayCircle, X } from "lucide-react";

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-blue-100/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="3ekLMS" className="h-8 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/solutions" className="hover:text-black transition-colors">Solutions</Link>
            <Link href="/resources" className="hover:text-black transition-colors">Resources</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            New: AI-Powered Learning Paths
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
            Redefine Learning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              with Immersive Labs.
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The all-in-one LMS platform for corporate training.
            Combine video courses with hands-on sandboxes for verified skill acquisition.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" /> Watch Demo
            </button>
            <Link href="/instructor" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all hover:border-gray-300 flex items-center justify-center gap-2">
              Instructor View
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all hover:border-gray-300 flex items-center justify-center gap-2">
              Student View
            </Link>
            <Link href="/admin" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all hover:border-gray-300 flex items-center justify-center gap-2">
              Admin View
            </Link>
          </div>

          {/* Feature Grid Mockup */}
          <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Hands-on Sandboxes", desc: "Spin up cloud environments directly in the browser." },
              { title: "AI Mentorship", desc: "Real-time feedback on code and assignments." },
              { title: "Verified Certificates", desc: "Blockchain-backed credentials for your team." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-gray-100 py-12 bg-white sticky bottom-0 -z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">© 2026 3ekLMS Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-black text-sm">Privacy</Link>
            <Link href="#" className="text-gray-500 hover:text-black text-sm">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Platform Demo</h3>
              <button onClick={() => setShowDemo(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center group">
              <img
                src="/demo.webp"
                alt="Platform Demo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
