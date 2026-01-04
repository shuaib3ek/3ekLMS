"use server";

import { prisma } from "@/lib/prisma";
import { Role, User } from "@prisma/client";

import { createSession, deleteSession } from "@/lib/session";

export async function loginAction(email: string, role: Role = 'LEARNER') {
    try {
        let user = await prisma.user.findFirst({
            where: { email },
            include: { org: true }
        });

        if (!user) {
            // Auto-signup logic (matching previous prototype behavior)
            // Assign to default org
            const defaultOrg = await prisma.organization.findFirst({
                where: { domain: '3ek.in' } // Assumption from seed
            });

            if (!defaultOrg) throw new Error("Default Organization not found");

            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    role,
                    orgId: defaultOrg.id,
                    password: 'demo_password' // Mock
                },
                include: { org: true }
            });
        }

        // --- SECURITY UPGRADE: Create Session Cookie ---
        await createSession(user.id, user.email, user.role, user.orgId);

        // Return serializable user object (dates to strings)
        return {
            success: true,
            user: {
                ...user,
                createdAt: user.createdAt.toISOString(),
            }
        };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, error: "Authentication failed" };
    }
}

export async function logoutAction() {
    await deleteSession();
    return { success: true };
}

export async function getUserAction(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { org: true }
        });
        if (!user) return null;
        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
        };
    } catch (e) {
        return null;
    }
}
