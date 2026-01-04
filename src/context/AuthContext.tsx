"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { db, User, Role } from "@/lib/db";

interface AuthContextType {
    user: User | null;
    login: (email: string, role?: Role) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Initialize DB (seed data if needed)
        db.init();

        // Check for persisted user session
        const storedUserId = localStorage.getItem("auth_user_id");
        if (storedUserId) {
            const foundUser = db.users.getById(storedUserId);
            if (foundUser) setUser(foundUser);
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, role: Role = 'LEARNER') => {
        let existingUser = db.users.getByEmail(email);

        if (!existingUser) {
            // Auto-signup for demo
            const newUser: User = {
                id: crypto.randomUUID(),
                email,
                name: email.split('@')[0],
                role: role,
                orgId: 'org_default',
                createdAt: new Date().toISOString(),
                avatar: `https://ui-avatars.com/api/?name=${email}&background=000&color=fff`
            };
            db.users.create(newUser);
            existingUser = newUser;
        }

        setUser(existingUser);
        localStorage.setItem("auth_user_id", existingUser.id);

        if (existingUser.role === 'INSTRUCTOR' || existingUser.role === 'SUPER_ADMIN') {
            router.push('/instructor');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user_id");
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
