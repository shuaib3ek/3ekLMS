"use server";

import { prisma } from "@/lib/prisma";
import { Role, EnrollmentStatus } from "@prisma/client";

export type EnrollmentRow = {
    email: string;
    name: string;
    role?: Role;
};

export type BulkEnrollmentResult = {
    success: boolean;
    count: number;
    errors?: string[];
};

export async function bulkEnrollStudentsAction(
    batchId: string,
    orgId: string,
    data: EnrollmentRow[]
): Promise<BulkEnrollmentResult> {
    if (!data || data.length === 0) {
        return { success: false, count: 0, errors: ["No data provided"] };
    }

    try {
        // Validation Phase
        const errors: string[] = [];
        const validEmails = new Set<string>();

        // 1. Basic validation loop
        data.forEach((row, index) => {
            if (!row.email || !row.email.includes('@')) {
                errors.push(`Row ${index + 1}: Invalid email '${row.email}'`);
            }
            validEmails.add(row.email);
        });

        if (errors.length > 0) {
            // Fail fast behavior -> All or Nothing
            return { success: false, count: 0, errors };
        }

        // 2. Cross-Org Pollution Check
        // Find if any of these emails already exist in a DIFFERENT organization
        const existingExternalUsers = await prisma.user.findMany({
            where: {
                email: { in: Array.from(validEmails) },
                orgId: { not: orgId }
            },
            select: { email: true }
        });

        if (existingExternalUsers.length > 0) {
            const conflictEmails = existingExternalUsers.map(u => u.email).join(", ");
            return {
                success: false,
                count: 0,
                errors: [`Security Violation: The following users belong to a different organization: ${conflictEmails}`]
            };
        }

        // 3. Atomic Transaction
        const result = await prisma.$transaction(async (tx) => {
            let processedCount = 0;

            for (const row of data) {
                // Upsert User
                const user = await tx.user.upsert({
                    where: { email: row.email },
                    update: {
                        name: row.name // Update name if provided? Optional decision. Let's say yes for fix.
                    },
                    create: {
                        email: row.email,
                        name: row.name,
                        orgId: orgId,
                        role: row.role || "LEARNER",
                        password: "temp_password_123" // In real app, trigger invite email
                    }
                });

                // Upsert Enrollment (Idempotent)
                await tx.enrollment.upsert({
                    where: {
                        userId_batchId: {
                            userId: user.id,
                            batchId: batchId
                        }
                    },
                    update: {}, // Already enrolled? Do nothing.
                    create: {
                        userId: user.id,
                        batchId: batchId,
                        status: EnrollmentStatus.ACTIVE
                    }
                });

                processedCount++;
            }

            return processedCount;
        });

        return { success: true, count: result };

    } catch (e) {
        console.error("Bulk Enrollment Error:", e);
        return { success: false, count: 0, errors: ["System Error during transaction rollback."] };
    }
}
