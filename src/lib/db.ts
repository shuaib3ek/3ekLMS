"use client";

// Type Definitions
export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'INSTRUCTOR' | 'LEARNER' | 'GUEST';

export interface Organization {
    id: string;
    name: string;
    domain: string; // e.g., 'acme.com'
    logo?: string;
    theme?: {
        primaryColor: string;
    };
}

export interface User {
    id: string;
    email: string;
    name: string;
    password?: string; // Mock password
    role: Role;
    orgId: string; // Belongs to an Org
    avatar?: string;
    createdAt: string;
}

export interface Program {
    id: string;
    orgId: string; // Owned by Org
    title: string;
    description: string;
    thumbnail: string;
    version: number;
    modules: Module[]; // Content Structure
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface Module {
    id: string;
    title: string;
    items: LearningItem[];
}

export interface LearningItem {
    id: string;
    title: string;
    type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB' | 'PROJECT';
    duration: number; // minutes
    contentUrl?: string; // Resource link
}

export interface Batch {
    id: string;
    programId: string;
    orgId: string;
    name: string; // "Feb 2026 Cohort"
    instructorIds: string[];
    startDate: string;
    endDate: string;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface Enrollment {
    id: string;
    userId: string;
    batchId: string;
    enrolledAt: string;
    status: 'ACTIVE' | 'DROPPED' | 'COMPLETED';
}

export interface Question {
    id: string;
    text: string;
    type: 'MCQ' | 'CODE';
    options?: string[]; // For MCQ    
    correctOption?: number; // Index
    points: number;
}

export interface Assessment {
    id: string;
    title: string;
    orgId: string;
    questions: Question[];
    durationMinutes: number;
    passingScore: number;
}

export interface AssessmentAttempt {
    id: string;
    assessmentId: string;
    userId: string;
    startedAt: string;
    completedAt?: string;
    score?: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface LabSession {
    id: string;
    userId: string;
    batchId?: string;
    environment: 'NODEJS' | 'PYTHON' | 'GO' | 'RUST' | 'AWS';
    status: 'PROVISIONING' | 'RUNNING' | 'TERMINATED';
    startedAt: string;
    expiresAt: string;
    instanceUrl?: string;
}

export interface AuditLog {
    id: string;
    action: string;
    userId: string;
    details: string;
    timestamp: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

// Mock Database Service
// Encapsulates all localStorage interactions and simulates relational queries.

const KEYS = {
    ORGS: 'lms_orgs',
    USERS: 'lms_users',
    PROGRAMS: 'lms_programs',
    BATCHES: 'lms_batches',
    ENROLLMENTS: 'lms_enrollments',
    ASSESSMENTS: 'lms_assessments',
    ATTEMPTS: 'lms_attempts',
    LAB_SESSIONS: 'lms_lab_sessions',
    AUDIT_LOGS: 'lms_audit_logs'
};

// Singleton Mock Data Layer
export const db = {
    // --- Initialization & Seeding ---
    init: () => {
        if (typeof window === 'undefined') return;

        // Seed default Organization if not exists
        if (!localStorage.getItem(KEYS.ORGS)) {
            const defaultOrg: Organization = {
                id: 'org_default',
                name: 'ThreeEK Academy',
                domain: '3ek.in',
                theme: { primaryColor: '#000000' }
            };
            localStorage.setItem(KEYS.ORGS, JSON.stringify([defaultOrg]));
        }

        // Seed Admin User
        if (!localStorage.getItem(KEYS.USERS)) {
            const admin: User = {
                id: 'user_admin',
                email: 'admin@3ek.in',
                name: 'System Administrator',
                role: 'SUPER_ADMIN',
                orgId: 'org_default',
                createdAt: new Date().toISOString()
            };
            // Seed Demo Student
            const student: User = {
                id: 'user_student',
                email: 'student@3ek.in',
                name: 'Alex Morgan',
                role: 'LEARNER',
                orgId: 'org_default',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(KEYS.USERS, JSON.stringify([admin, student]));
        }
    },

    // --- Generic Helpers ---
    _get: <T>(key: string): T[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    _save: <T>(key: string, data: T[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
        // Dispatch storage event for reactivity
        window.dispatchEvent(new Event('storage'));
    },

    // --- Operations ---

    // User Ops
    users: {
        getAll: () => db._get<User>(KEYS.USERS),
        getById: (id: string) => db._get<User>(KEYS.USERS).find(u => u.id === id),
        getByEmail: (email: string) => db._get<User>(KEYS.USERS).find(u => u.email === email),
        create: (user: User) => {
            const users = db._get<User>(KEYS.USERS);
            // Dedupe
            if (users.find(u => u.email === user.email)) return null;
            const newUsers = [...users, user];
            db._save(KEYS.USERS, newUsers);
            return user;
        },
        updateRole: (userId: string, role: Role) => {
            const users = db._get<User>(KEYS.USERS);
            const idx = users.findIndex(u => u.id === userId);
            if (idx === -1) return null;
            users[idx].role = role;
            db._save(KEYS.USERS, users);
            return users[idx];
        }
    },

    // Program Ops
    programs: {
        getAll: () => db._get<Program>(KEYS.PROGRAMS),
        create: (prog: Program) => {
            const progs = db._get<Program>(KEYS.PROGRAMS);
            db._save(KEYS.PROGRAMS, [...progs, prog]);
            return prog;
        }
    },

    // Batch Ops (The core of ILT)
    batches: {
        getAll: () => db._get<Batch>(KEYS.BATCHES),
        getByOrg: (orgId: string) => db._get<Batch>(KEYS.BATCHES).filter(b => b.orgId === orgId),
        create: (batch: Batch) => {
            const batches = db._get<Batch>(KEYS.BATCHES);
            db._save(KEYS.BATCHES, [...batches, batch]);
            return batch;
        },
        assignInstructor: (batchId: string, instructorId: string) => {
            const batches = db._get<Batch>(KEYS.BATCHES);
            const batch = batches.find(b => b.id === batchId);
            if (batch) {
                if (!batch.instructorIds.includes(instructorId)) {
                    batch.instructorIds.push(instructorId);
                    db._save(KEYS.BATCHES, batches);
                }
            }
        }
    },

    // Enrollment Ops
    enrollments: {
        enroll: (userId: string, batchId: string) => {
            const enrollments = db._get<Enrollment>(KEYS.ENROLLMENTS);
            if (enrollments.find(e => e.userId === userId && e.batchId === batchId)) return;

            const newEnrollment: Enrollment = {
                id: crypto.randomUUID(),
                userId,
                batchId,
                enrolledAt: new Date().toISOString(),
                status: 'ACTIVE'
            };
            db._save(KEYS.ENROLLMENTS, [...enrollments, newEnrollment]);
            return newEnrollment;
        },
        getByUser: (userId: string) => db._get<Enrollment>(KEYS.ENROLLMENTS).filter(e => e.userId === userId),
        getByBatch: (batchId: string) => db._get<Enrollment>(KEYS.ENROLLMENTS).filter(e => e.batchId === batchId)
    },

    // Assessment Ops
    assessments: {
        getAll: () => db._get<Assessment>(KEYS.ASSESSMENTS),
        getById: (id: string) => db._get<Assessment>(KEYS.ASSESSMENTS).find(a => a.id === id),
        create: (assessment: Assessment) => {
            const list = db._get<Assessment>(KEYS.ASSESSMENTS);
            db._save(KEYS.ASSESSMENTS, [...list, assessment]);
            return assessment;
        }
    },

    attempts: {
        create: (attempt: AssessmentAttempt) => {
            const list = db._get<AssessmentAttempt>(KEYS.ATTEMPTS);
            db._save(KEYS.ATTEMPTS, [...list, attempt]);
            return attempt;
        },
        getByUser: (userId: string) => db._get<AssessmentAttempt>(KEYS.ATTEMPTS).filter(a => a.userId === userId)
    },

    // Lab Ops
    labSessions: {
        getAll: () => db._get<LabSession>(KEYS.LAB_SESSIONS),
        getByUser: (userId: string) => db._get<LabSession>(KEYS.LAB_SESSIONS).filter(s => s.userId === userId),
        create: (session: LabSession) => {
            const list = db._get<LabSession>(KEYS.LAB_SESSIONS);
            // Terminate other active sessions for this user (mocking resource limit)
            const active = list.filter(s => s.userId === session.userId && s.status !== 'TERMINATED');
            active.forEach(s => s.status = 'TERMINATED');

            db._save(KEYS.LAB_SESSIONS, [...list, session]);
            return session;
        },
        terminate: (sessionId: string) => {
            const list = db._get<LabSession>(KEYS.LAB_SESSIONS);
            const idx = list.findIndex(s => s.id === sessionId);
            if (idx !== -1) {
                list[idx].status = 'TERMINATED';
                db._save(KEYS.LAB_SESSIONS, list);
            }
        }
    },

    // Audit Logs
    logs: {
        getAll: () => db._get<AuditLog>(KEYS.AUDIT_LOGS).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        log: (action: string, userId: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
            const list = db._get<AuditLog>(KEYS.AUDIT_LOGS);
            const newLog: AuditLog = {
                id: crypto.randomUUID(),
                action,
                userId,
                details,
                severity,
                timestamp: new Date().toISOString()
            };
            db._save(KEYS.AUDIT_LOGS, [...list, newLog]);
        }
    }
};
