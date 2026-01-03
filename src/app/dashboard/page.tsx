import { ArrowUpRight, PlayCircle, Clock, Trophy } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Alex.</h1>
                    <p className="text-gray-500">Pick up where you left off. You have 2 pending labs.</p>
                </div>
                <button className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                    <PlayCircle className="w-4 h-4" /> Resume Learning
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Hours Learned", value: "48.5h", icon: Clock },
                    { label: "Active Courses", value: "4", icon: PlayCircle },
                    { label: "Certificates", value: "2", icon: Trophy },
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all duration-300">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Courses */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                    <button className="text-sm font-medium text-gray-500 hover:text-black hover:underline">View all</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: "Advanced AWS Networking", progress: 65, type: "Lab", color: "bg-blue-100 text-blue-700" },
                        { title: "React Design Patterns", progress: 30, type: "Video", color: "bg-purple-100 text-purple-700" },
                        { title: "Kubernetes Security", progress: 0, type: "Course", color: "bg-orange-100 text-orange-700" },
                    ].map((course, i) => (
                        <div key={i} className="group p-6 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <div className="flex items-start justify-between mb-8">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.color}`}>{course.type}</span>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-4 pr-4">{course.title}</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
