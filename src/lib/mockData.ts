export interface Course {
    id: string;
    title: string;
    description: string;
    category: "Cloud" | "DevOps" | "Security" | "Development" | "AI";
    level: "Beginner" | "Intermediate" | "Advanced";
    duration: string;
    rating: number;
    students: number;
    image: string;
    lessons: number;
    hasLab: boolean;
    price: string;
    instructor: {
        name: string;
        role: string;
        avatar: string;
    };
    curriculum: {
        title: string;
        items: string[];
    }[];
}

export const courses: Course[] = [
    {
        id: "aws-arch-101",
        title: "AWS Solutions Architect Associate",
        description: "Master the fundamentals of building scalable and secure applications on Amazon Web Services. Includes 10 hands-on labs.",
        category: "Cloud",
        level: "Intermediate",
        duration: "24h 30m",
        rating: 4.8,
        students: 1240,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2944&auto=format&fit=crop",
        lessons: 45,
        hasLab: true,
        price: "$0 (Enterprise)",
        instructor: {
            name: "Sarah Chen",
            role: "Senior Cloud Architect",
            avatar: "",
        },
        curriculum: [
            { title: "IAM & Security", items: ["Introduction to IAM", "Lab: Creating secure roles", "Policy simulator"] },
            { title: "EC2 & Compute", items: ["Instance types", "Lab: Launching a web server", "Auto Scaling Groups"] },
            { title: "S3 & Storage", items: ["Bucket policies", "Versioning", "Glacier Deep Dive"] },
        ]
    },
    {
        id: "k8s-mastery",
        title: "Kubernetes for DevOps Engineers",
        description: "Deep dive into container orchestration. Learn to deploy, scale, and manage containerized applications.",
        category: "DevOps",
        level: "Advanced",
        duration: "18h 15m",
        rating: 4.9,
        students: 850,
        image: "https://images.unsplash.com/photo-1667372393119-c81c0cda0129?q=80&w=2832&auto=format&fit=crop",
        lessons: 32,
        hasLab: true,
        price: "$0 (Enterprise)",
        instructor: {
            name: "Marcus Johnson",
            role: "DevOps Lead",
            avatar: "",
        },
        curriculum: [
            { title: "Architecture", items: ["Control Plane vs Node", "Pod Lifecycle", "Networking model"] },
            { title: "Deployments", items: ["Lab: Rolling updates", "StatefulSets", "Helm Charts"] },
        ]
    },
    {
        id: "react-adv-patterns",
        title: "Advanced React Patterns",
        description: "Take your React skills to the next level with compound components, render props, and custom hooks.",
        category: "Development",
        level: "Advanced",
        duration: "12h 00m",
        rating: 4.7,
        students: 2100,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop",
        lessons: 28,
        hasLab: true,
        price: "$0 (Enterprise)",
        instructor: {
            name: "Alex Rivera",
            role: "Frontend Staff Engineer",
            avatar: "",
        },
        curriculum: [
            { title: "Hooks Deep Dive", items: ["useMemo & useCallback", "Lab: Custom hook library", "Performance tuning"] },
            { title: "Design Patterns", items: ["Compound Components", "Control Props", "State Reducers"] },
        ]
    },
    {
        id: "gen-ai-intro",
        title: "Introduction to Generative AI",
        description: "Understand the foundations of LLMs, prompt engineering, and building AI-powered applications.",
        category: "AI",
        level: "Beginner",
        duration: "8h 45m",
        rating: 4.9,
        students: 3400,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop",
        lessons: 15,
        hasLab: false,
        price: "$0 (Enterprise)",
        instructor: {
            name: "Dr. Emily Zhang",
            role: "AI Researcher",
            avatar: "",
        },
        curriculum: [
            { title: "LLM Basics", items: ["Transformers explained", "Tokenization", "Temperature & Top-P"] },
            { title: "Prompt Engineering", items: ["Zero-shot vs Few-shot", "Chain of thought", "Lab: Building a chatbot"] },
        ]
    },
    {
        id: "python-mastery",
        title: "Python for Everyone",
        description: "Learn Python from scratch. Covers variables, loops, functions, and object-oriented programming.",
        category: "Development",
        level: "Beginner",
        duration: "10h 00m",
        rating: 4.8,
        students: 5000,
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2832&auto=format&fit=crop",
        lessons: 40,
        hasLab: true,
        price: "$0 (Enterprise)",
        instructor: {
            name: "Guido van Rossum (AI)",
            role: "Python Creator",
            avatar: "",
        },
        curriculum: [
            { title: "Basics", items: ["Variables & Types", "Control Flow", "Functions"] },
            { title: "OOP", items: ["Classes", "Inheritance", "Polymorphism"] },
        ]
    },
];
