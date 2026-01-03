"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    role: "student" | "instructor";
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, role: "student" | "instructor") => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for persisted user
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, role: "student" | "instructor") => {
        // Mock login logic
        let newUser: User;

        if (role === 'instructor') {
            newUser = {
                id: "inst_123",
                name: "Sarah Chen",
                email: email,
                role: "instructor",
                avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=000&color=fff"
            };
        } else {
            newUser = {
                id: "stu_123",
                name: "Alex Morgan",
                email: email,
                role: "student",
                avatar: "https://ui-avatars.com/api/?name=Alex+Morgan&background=000&color=fff"
            };
        }

        setUser(newUser);
        localStorage.setItem("auth_user", JSON.stringify(newUser));

        if (role === 'instructor') {
            router.push('/instructor');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
