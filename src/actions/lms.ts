"use server";

import { prisma } from "@/lib/prisma";
import { Role, TrainingType } from "@prisma/client";
import { verifySession } from "@/lib/session";

// --- Admin Actions ---

export async function getAllUsers(orgId?: string) {
    try {
        const where = orgId ? { orgId } : {};
        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { org: true }
        });
        return users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }));
    } catch (e) {
        console.error("Get Users Error", e);
        return [];
    }
}

export async function createUserAction(data: { name: string; email: string; role: Role; orgId: string; password?: string }) {
    try {
        // RBAC: Only Super Admin
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            const isOrgAdmin = session?.role === 'ORG_ADMIN';
            // Allow Org Admin to create LEARNER only? NO. Strict Read-Only.
            // Prompt: "❌ Cannot manage users".
            return { success: false, error: "Permission Denied: Only Super Admins can create users." };
        }

        // Check if user exists globally (Email must be unique)
        const existing = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (existing) {
            return { success: false, error: "User already exists (Global Email Uniqueness)" };
        }

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                orgId: data.orgId,
                password: data.password || "password123" // Default password
            }
        });

        return { success: true, user: newUser };
    } catch (e) {
        console.error("Create User Error", e);
        return { success: false, error: (e as Error).message };
    }
}

export async function updateUserAction(data: { id: string; name: string; email: string; role: Role }) {
    try {
        // RBAC: Super Admin Only
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied: Only Super Admins can update users." };
        }

        await prisma.user.update({
            where: { id: data.id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role
            }
        });
        return { success: true };
    } catch (e) {
        console.error("Update User Error", e);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUserAction(userId: string) {
    try {
        // RBAC: Super Admin Only
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied: Only Super Admins can delete users." };
        }

        // Best effort manual cascade (if schema doesn't have it)
        await prisma.enrollment.deleteMany({ where: { userId } });
        await prisma.attendance.deleteMany({ where: { userId } });
        await prisma.labSession.deleteMany({ where: { userId } });

        await prisma.user.delete({
            where: { id: userId }
        });
        return { success: true };
    } catch (e) {
        console.error("Delete User Error", e);
        return { success: false, error: "Failed to delete user. Ensure they are not an Instructor of a Batch." };
    }
}

export async function getSystemAnalytics(orgId: string) {
    const session = await verifySession();
    const isSuperAdmin = session?.role === 'SUPER_ADMIN';

    // Scope: If Super Admin, view ALL. Else, view strict Org.
    const userScope = isSuperAdmin ? {} : { orgId };
    const programScope = isSuperAdmin ? {} : { program: { orgId } };
    const enrollmentScope = isSuperAdmin ? {} : { batch: { program: { orgId } } };

    const userCount = await prisma.user.count({ where: userScope });

    // Batch Distribution
    const batches = await prisma.batch.findMany({
        where: programScope,
        select: { status: true }
    });

    const totalBatches = batches.length;
    const active = batches.filter(b => b.status === 'ACTIVE').length;
    const planned = batches.filter(b => b.status === 'PLANNED').length;
    const completed = batches.filter(b => b.status === 'COMPLETED').length;

    // Activity (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.findMany({
        where: {
            ...userScope,
            createdAt: { gte: sevenDaysAgo }
        },
        select: { createdAt: true }
    });

    const activityData = Array(7).fill(0);
    recentUsers.forEach(u => {
        const dayDiff = Math.floor((new Date().getTime() - u.createdAt.getTime()) / (1000 * 3600 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
            activityData[6 - dayDiff]++;
        }
    });

    // System Alerts Generation
    const alerts: { type: string; message: string; time: string; level: 'critical' | 'warning' | 'info' }[] = [];

    // Alert 1: Batches needing instructors
    const batchesWithInstructors = await prisma.batch.findMany({
        where: programScope,
        include: { instructors: true }
    });

    batchesWithInstructors.forEach(b => {
        const isLive = ['PLANNED', 'ACTIVE', 'UPCOMING'].includes(b.status);
        if (isLive && b.instructors.length === 0) {
            alerts.push({
                type: 'BATCH_NEEDS_ATTENTION',
                message: `New Batch "${b.name}" requires an instructor assignment.`,
                time: b.createdAt.toISOString(),
                level: 'critical'
            });
        }
    });

    // Alert 2: Recent Enrollments
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentEnrollments = await prisma.enrollment.count({
        where: {
            enrolledAt: { gte: oneDayAgo },
            ...enrollmentScope
        }
    });

    if (recentEnrollments > 0) {
        alerts.push({
            type: 'ENROLLMENT_SPIKE',
            message: `${recentEnrollments} new student enrollments in the last 24 hours.`,
            time: new Date().toISOString(),
            level: 'info'
        });
    }

    const finalAlerts = alerts.slice(0, 5);

    return {
        totalUsers: userCount,
        activeBatches: active,
        avgScore: 0,
        batchDistribution: {
            active,
            planned,
            completed,
            total: totalBatches
        },
        userActivity: activityData,
        systemAlerts: finalAlerts
    };
}

// --- Organization Actions ---
export async function getAllOrgs() {
    try {
        const orgs = await prisma.organization.findMany();
        return orgs;
    } catch (e) {
        return [];
    }
}

export async function createOrgAction(data: { name: string; domain?: string }) {
    try {
        // RBAC should be strictly Super Admin (implied as this is an Admin action usually)
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied." };
        }

        // Check if domain already exists
        if (data.domain) {
            const existing = await prisma.organization.findUnique({
                where: { domain: data.domain }
            });
            if (existing) {
                return { success: false, error: "Domain already exists" };
            }
        }

        const newOrg = await prisma.organization.create({
            data: {
                name: data.name,
                domain: data.domain || null
            }
        });

        return { success: true, org: newOrg };
    } catch (e) {
        console.error("Create Org Error", e);
        return { success: false, error: "Failed to create organization" };
    }
}

// --- Program Actions ---
export async function getAllPrograms(orgId: string) {
    try {
        const programs = await prisma.program.findMany({
            where: { orgId },
            include: { _count: { select: { batches: true } } }
        });
        return programs;
    } catch (e) {
        return [];
    }
}


// --- Instructor Actions ---

// --- Batch Actions ---

export async function getAllBatches(orgId?: string) {
    try {
        const where = orgId ? { orgId } : {};
        const batches = await prisma.batch.findMany({
            where,
            include: {
                program: true,
                _count: { select: { students: true } }
            },
            orderBy: { startDate: 'desc' }
        });
        return batches.map(b => ({
            ...b,
            startDate: b.startDate.toISOString(),
            endDate: b.endDate.toISOString(),
            createdAt: b.createdAt.toISOString()
        }));
    } catch (e) {
        console.error("Get All Batches Error", e);
        return [];
    }
}

export async function createBatchAction(data: {
    name: string;
    orgId: string;
    startDate: string;
    endDate: string;
    type: TrainingType;
    trainingEnabled: boolean;
    labEnabled: boolean;
    assessmentEnabled: boolean;
    schedule: string;
    trainingConfig?: any;
    labConfig?: any;
    assessmentConfig?: any;
}) {
    try {
        // RBAC: Super Admin Only
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied: Only Super Admins can create batches." };
        }

        // 1. Core Validation (Checkbox Logic)
        if (!data.trainingEnabled && !data.labEnabled && !data.assessmentEnabled) {
            return { success: false, error: "At least one feature (Training, Labs, or Assessments) must be enabled." };
        }
        if (!data.trainingEnabled && data.labEnabled && data.assessmentEnabled) {
            return { success: false, error: "Invalid Configuration: Labs and Assessments cannot be combined without Training." };
        }

        // 2. Training Time Governance
        if (data.trainingEnabled) {
            if (!data.trainingConfig?.days?.length || !data.trainingConfig?.startTime || !data.trainingConfig?.endTime) {
                return { success: false, error: "Training is enabled: Days and Time Slot must be configured." };
            }
        }

        // 3. Lab Time Governance
        if (data.labEnabled) {
            if (!data.labConfig?.mode) {
                return { success: false, error: "Labs enabled: Access Mode must be selected." };
            }
        }

        // 4. Assessment Authority Rule
        let finalAssessmentConfig = data.assessmentConfig;
        if (data.assessmentEnabled) {
            if (data.trainingEnabled) {
                finalAssessmentConfig = {
                    mode: 'TRAINER_MANAGED',
                    status: 'PENDING_TRAINER',
                    note: 'Assessment schedule to be defined by Instructor once batch starts.'
                };
            } else {
                if (!data.assessmentConfig?.startDate || !data.assessmentConfig?.endDate) {
                    return { success: false, error: "Assessment-Only Batch: Admin must define Start/End window." };
                }
                finalAssessmentConfig = {
                    ...data.assessmentConfig,
                    mode: 'ADMIN_MANAGED'
                };
            }
        }

        // Batch-First: Automatically create a "Program" container for this batch
        const program = await prisma.program.create({
            data: {
                title: data.name,
                orgId: data.orgId,
                curriculum: []
            }
        });

        const batch = await prisma.batch.create({
            data: {
                name: data.name,
                programId: program.id,
                orgId: data.orgId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                type: data.type,
                trainingEnabled: data.trainingEnabled,
                labEnabled: data.labEnabled,
                assessmentEnabled: data.assessmentEnabled,

                schedule: data.schedule,
                trainingConfig: data.trainingConfig || undefined,
                labConfig: data.labConfig || undefined,
                assessmentConfig: finalAssessmentConfig || undefined,

                status: 'PLANNED'
            }
        });

        return { success: true, batch };
    } catch (e) {
        console.error("Create Batch Error", e);
        return { success: false, error: "Failed to create batch" };
    }
}

export async function updateBatchAction(data: {
    id: string;
    orgId: string;
    name: string;
    startDate: string;
    endDate: string;
    type: TrainingType;
    trainingEnabled: boolean;
    labEnabled: boolean;
    assessmentEnabled: boolean;
    schedule: string;
    trainingConfig?: any;
    labConfig?: any;
    assessmentConfig?: any;
    ownerId?: string;
}) {
    try {
        // RBAC: Super Admin Only
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied: Only Super Admins can update batches." };
        }

        // 1. Validation (Strict Time Governance Logic)
        if (!data.trainingEnabled && !data.labEnabled && !data.assessmentEnabled) {
            return { success: false, error: "At least one feature must be enabled." };
        }
        if (!data.trainingEnabled && data.labEnabled && data.assessmentEnabled) {
            return { success: false, error: "Invalid: Labs + Assessments require Training." };
        }

        // Training Governance
        if (data.trainingEnabled && (!data.trainingConfig?.days?.length || !data.trainingConfig?.startTime || !data.trainingConfig?.endTime)) {
            return { success: false, error: "Training enabled: Schedule is required." };
        }

        // Lab Governance
        if (data.labEnabled && !data.labConfig?.mode) {
            return { success: false, error: "Labs enabled: Access Mode is required." };
        }

        // Assessment Governance
        let finalAssessmentConfig = data.assessmentConfig;
        if (data.assessmentEnabled) {
            if (data.trainingEnabled) {
                finalAssessmentConfig = {
                    mode: 'TRAINER_MANAGED',
                    status: 'PENDING_TRAINER',
                    note: 'Assessment schedule to be defined by Instructor.'
                };
            } else {
                if (!data.assessmentConfig?.startDate || !data.assessmentConfig?.endDate) {
                    return { success: false, error: "Assessment-Only: Admin window required." };
                }
                finalAssessmentConfig = { ...data.assessmentConfig, mode: 'ADMIN_MANAGED' };
            }
        }

        const batch = await prisma.batch.update({
            where: { id: data.id },
            data: {
                name: data.name,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                type: data.type,
                trainingEnabled: data.trainingEnabled,
                labEnabled: data.labEnabled,
                assessmentEnabled: data.assessmentEnabled,
                schedule: data.schedule,
                trainingConfig: data.trainingConfig || undefined,
                labConfig: data.labConfig || undefined,
                assessmentConfig: finalAssessmentConfig || undefined,
                ownerId: data.ownerId || undefined,
            }
        });

        if (batch.programId) {
            await prisma.program.update({
                where: { id: batch.programId },
                data: { title: data.name }
            });
        }

        return { success: true, batch };
    } catch (e) {
        console.error("Update Batch Error", e);
        return { success: false, error: "Failed to update batch" };
    }
}

export async function enrollUserToBatchAction(data: {
    email: string;
    name: string;
    batchId: string;
    orgId: string;
    role?: Role;
}) {
    try {
        // RBAC: Super Admin Only
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied: Only Super Admins can assign users." };
        }

        // 1. Check if user exists (Globally, for this Org)
        let user = await prisma.user.findFirst({
            where: { email: data.email, orgId: data.orgId } // Org Context still applied for finding target
        });

        let isNewUser = false;

        // 2. If not, create user
        if (!user) {
            // Re-check Global Uniqueness for safety
            const existingGlobal = await prisma.user.findUnique({ where: { email: data.email } });
            if (existingGlobal) return { success: false, error: "User exists in another Organization." };

            isNewUser = true;
            user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    orgId: data.orgId,
                    role: data.role || 'LEARNER',
                    password: "password123" // Default
                }
            });
        }

        // 3. Enroll in Batch
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_batchId: {
                    userId: user.id,
                    batchId: data.batchId
                }
            }
        });

        if (existingEnrollment) {
            return { success: false, error: "User already enrolled in this batch" };
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                batchId: data.batchId,
                status: 'ACTIVE'
            }
        });

        return { success: true, enrollment, isNewUser };
    } catch (e) {
        console.error("Enroll User Error", e);
        return { success: false, error: "Failed to enroll user" };
    }
}

export async function bulkEnrollUsersAction(data: {
    batchId: string;
    orgId: string;
    users: { name: string; email: string }[]
}) {
    try {
        // RBAC: Super Admin Only
        const session = await verifySession();
        if (session?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Permission Denied: Only Super Admins can bulk enroll." };
        }

        let stats = { success: 0, failed: 0, newUsers: 0, existing: 0 };

        for (const u of data.users) {
            try {
                // 1. Find or Create User
                let user = await prisma.user.findFirst({
                    where: { email: u.email, orgId: data.orgId }
                });

                if (!user) {
                    const existingGlobal = await prisma.user.findUnique({ where: { email: u.email } });
                    if (existingGlobal) {
                        stats.failed++; // Exists elsewhere
                        continue;
                    }

                    user = await prisma.user.create({
                        data: {
                            name: u.name,
                            email: u.email,
                            orgId: data.orgId,
                            role: 'LEARNER',
                            password: "password123"
                        }
                    });
                    stats.newUsers++;
                } else {
                    stats.existing++;
                }

                // 2. Enroll
                const existingEnrollment = await prisma.enrollment.findUnique({
                    where: { userId_batchId: { userId: user.id, batchId: data.batchId } }
                });

                if (!existingEnrollment) {
                    await prisma.enrollment.create({
                        data: { userId: user.id, batchId: data.batchId, status: 'ACTIVE' }
                    });
                    stats.success++;
                } else {
                    stats.success++; // Count existing enrollment as successful check
                }
            } catch (err) {
                console.error(`Failed to enroll ${u.email}`, err);
                stats.failed++;
            }
        }

        return { success: true, stats };
    } catch (e) {
        console.error("Bulk Enroll Error", e);
        return { success: false, error: "Bulk enroll failed" };
    }
}

export async function getInstructorBatches(instructorId: string) {
    try {
        const batches = await prisma.batch.findMany({
            where: {
                instructors: { some: { id: instructorId } }
            },
            include: {
                program: true,
                students: true
            }
        });
        return batches.map(b => ({
            ...b,
            startDate: b.startDate.toISOString(),
            endDate: b.endDate.toISOString(),
            createdAt: b.createdAt.toISOString()
        }));
    } catch (e) {
        return [];
    }
}

export async function getBatchDetails(batchId: string) {
    try {
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
            include: {
                program: true,
                sessions: {
                    orderBy: { startTime: 'asc' }
                },
                students: {
                    include: { user: true }
                },
                owner: true
            }
        });

        if (!batch) return null;

        return {
            ...batch,
            startDate: batch.startDate.toISOString(),
            endDate: batch.endDate.toISOString(),
            createdAt: batch.createdAt.toISOString(),
            sessions: batch.sessions.map(s => ({
                ...s,
                startTime: s.startTime.toISOString(),
                endTime: s.endTime.toISOString()
            }))
        };
    } catch (e) {
        console.error("Get Batch Details Error", e);
        return null;
    }
}

export async function getStudentEnrollments(studentId: string) {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: studentId, status: 'ACTIVE' },
            include: {
                batch: {
                    include: { program: true }
                }
            }
        });
        return enrollments.map(e => ({
            ...e,
            enrolledAt: e.enrolledAt.toISOString(),
            batch: {
                ...e.batch,
                startDate: e.batch.startDate.toISOString(),
                endDate: e.batch.endDate.toISOString(),
                createdAt: e.batch.createdAt.toISOString()
            }
        }));
    } catch (e) {
        return [];
    }
}
