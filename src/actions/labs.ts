"use server";

import { prisma } from "@/lib/prisma";
import { glocumal } from "@/lib/glocumal-client";
import { LabStatus } from "@prisma/client";

export async function provisionLabForUser(userId: string, labType: string) {
    try {
        console.log(`[Glocumal] Provisioning ${labType} for ${userId}...`);

        // 1. Call External API
        const instance = await glocumal.provisionLab({
            region: 'us-east-1',
            blueprintId: labType,
            durationMinutes: 120
        });

        // 2. Record in DB
        const labSession = await prisma.labSession.create({
            data: {
                userId,
                labType,
                status: LabStatus.RUNNING, // Mapped from instance.status
                instanceUrl: instance.url,
                expiresAt: instance.expiresAt
            }
        });

        return { success: true, url: instance.url, expiresAt: instance.expiresAt };

    } catch (e: any) {
        console.error("Lab Provision Error:", e);
        return { success: false, error: e.message };
    }
}

export async function bulkProvisionBatchLabs(batchId: string, labType: string) {
    // 1. Get all students
    const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: { students: true } // Relation through Enrollment... wait.
    });

    // Schema Check: Batch -> students is Enrollment[]. User is Enrollment.user.
    // Need to include user in students.
    const batchWithUsers = await prisma.batch.findUnique({
        where: { id: batchId },
        include: {
            students: {
                include: { user: true }
            }
        }
    });

    if (!batchWithUsers) return { success: false, error: "Batch not found" };

    let count = 0;
    const errors = [];

    // Parallel provisioning (bounded?)
    // In production, use a Queue (BullMQ). Here, Promise.all with chunking or simple loop.
    for (const enrollment of batchWithUsers.students) {
        try {
            await provisionLabForUser(enrollment.userId, labType);
            count++;
        } catch (e: any) {
            errors.push(`${enrollment.user.email}: ${e.message}`);
        }
    }

    return {
        success: true,
        provisioned: count,
        total: batchWithUsers.students.length,
        errors
    };
}
