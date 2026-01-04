"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, Role } from "@prisma/client"; // Use Prisma types
import { loginAction, getUserAction } from "@/actions/auth";

// Extended User type for frontend (if we need extra fields like avatar mock)
type AuthUser = Omit<User, 'createdAt'> & { createdAt: string; avatar?: string };

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, role?: Role) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const storedUserId = localStorage.getItem("auth_user_id");
            if (storedUserId) {
                const foundUser = await getUserAction(storedUserId);
                if (foundUser) {
                    // Add mock avatar for backward compat visual
                    const avatar = `https://ui-avatars.com/api/?name=${foundUser.email}&background=000&color=fff`;
                    setUser({ ...foundUser, avatar });
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, role: Role = 'LEARNER') => {
        setIsLoading(true);
        const result = await loginAction(email, role);

        if (result.success && result.user) {
            const avatar = `https://ui-avatars.com/api/?name=${result.user.email}&background=000&color=fff`;
            const authUser: AuthUser = { ...result.user, avatar };

            setUser(authUser);
            localStorage.setItem("auth_user_id", authUser.id);

            if (authUser.role === 'SUPER_ADMIN' || authUser.role === 'ORG_ADMIN') {
                router.push('/admin');
            } else if (authUser.role === 'INSTRUCTOR') {
                router.push('/instructor');
            } else {
                router.push('/dashboard');
            }
        } else {
            alert("Login Failed");
        }
        setIsLoading(false);
    };

    const logout = async () => {
        const { logoutAction } = await import("@/actions/auth");
        await logoutAction(); // Clear server cookie
        setUser(null);
        localStorage.removeItem("auth_user_id"); // Clear client cache
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
