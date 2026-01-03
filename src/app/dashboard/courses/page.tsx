"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowUpRight, PlayCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MyCoursesPage() {
    const { user } = useAuth();

    // Mock enrolled courses - normally fetched from backend
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

    useEffect(() => {
        const loadCourses = () => {
            // 1. Get all potential courses (Instructor created + Mocks if we had access, but let's assume we want to show anything the user engaged with)
            // For this demo, let's treat the 'mock' initial state as the "available catalog" + instructor courses
            const savedInstructorCourses = localStorage.getItem("instructor_courses");
            const instructorCourses = savedInstructorCourses ? JSON.parse(savedInstructorCourses) : [];

            // We need to reconstruct the "Catalog" here or import it.
            // Since we can't easily import 'courses' inside useEffect cleanly without scope issues if not imported at top,
            // let's define the base catalog here akin to the mockData or rely on what was previously hardcoded.
            // Better yet, let's just use the instructorCourses AND the hardcoded mocks from the initial state as our "Database"

            const initialMockCatalog = [
                {
                    id: "aws-arch-101",
                    title: "Advanced AWS Networking",
                    instructor: "Sarah Chen",
                    progress: 65,
                    totalLessons: 24,
                    completedLessons: 16,
                    lastAccessed: "2 days ago",
                    thumbnail: "bg-blue-100"
                },
                {
                    id: "react-adv-patterns",
                    title: "React Design Patterns",
                    instructor: "Michael Ross",
                    progress: 30,
                    totalLessons: 40,
                    completedLessons: 12,
                    lastAccessed: "5 hours ago",
                    thumbnail: "bg-purple-100"
                },
                {
                    id: "k8s-mastery",
                    title: "Kubernetes Security",
                    instructor: "Sarah Chen",
                    progress: 0,
                    totalLessons: 18,
                    completedLessons: 0,
                    lastAccessed: "1 week ago",
                    thumbnail: "bg-orange-100"
                }
            ];

            // Normalize instructor courses
            const normalizedInstructorCourses = instructorCourses.map((c: any) => ({
                id: c.id,
                title: c.title,
                instructor: "Demo Instructor",
                progress: 0,
                totalLessons: c.curriculum ? c.curriculum.reduce((acc: number, sec: any) => acc + (sec.lessons?.length || 0), 0) : 0,
                completedLessons: 0,
                lastAccessed: "Just now",
                thumbnail: c.thumbnail || "bg-gray-100"
            }));

            const allCourses = [...initialMockCatalog, ...normalizedInstructorCourses];

            // 2. Get Enrollments
            const savedEnrollments = localStorage.getItem("student_enrollments");
            const enrolledIds = savedEnrollments ? JSON.parse(savedEnrollments) : [];

            // 3. Filter
            // If NO enrollments exist yet (first time load), maybe we don't show anything? 
            // Or we show the default mocks as "pre-enrolled" for the demo?
            // Let's show ONLY strictly enrolled to prove the feature works. 
            // BUT for the very first UX, it might be empty. Let's pre-populate enrollments if empty for the demo feel.

            let finalCourses = [];

            if (enrolledIds.length === 0 && !savedEnrollments) {
                // First time ever: auto-enroll in the mocks for good demo UX
                const defaultIds = ["aws-arch-101", "react-adv-patterns"];
                localStorage.setItem("student_enrollments", JSON.stringify(defaultIds));
                finalCourses = initialMockCatalog.filter(c => defaultIds.includes(c.id));
            } else {
                finalCourses = allCourses.filter(c => enrolledIds.includes(c.id));
            }

            setEnrolledCourses(finalCourses);
        };

        loadCourses();
        // Add listener for storage changes to auto-update
        window.addEventListener('storage', loadCourses);
        return () => window.removeEventListener('storage', loadCourses);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                <p className="text-gray-500 mt-1">Track your progress and continue learning.</p>
            </div>

            {/* In Progress */}
            <div className="space-y-6">
                {enrolledCourses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        {/* Thumbnail */}
                        <div className={`w-full md:w-64 h-40 rounded-xl ${course.thumbnail} flex-shrink-0`} />

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                                    <Link href={`/learn/${course.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Instructor: {course.instructor}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-900">{course.progress}% Complete</span>
                                    <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} Lessons</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 gap-2">
                            <Link href={`/learn/${course.id}`} className="w-full md:w-auto px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                <PlayCircle className="w-4 h-4" /> Continue
                            </Link>
                            <div className="text-center">
                                <span className="text-xs text-gray-400 font-medium">Last active {course.lastAccessed}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {enrolledCourses.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Explore our catalog to find courses that match your interests.</p>
                    <Link href="/courses" className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                        Browse Catalog
                    </Link>
                </div>
            )}
        </div>
    );
}
