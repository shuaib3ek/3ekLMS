
import { Role } from "@prisma/client";

// --- Types ---

export interface User {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ORG_ADMIN" | "INSTRUCTOR" | "LEARNER" | string;
    orgId: string;
    avatar?: string;
}

export interface Assessment {
    id: string;
    title: string;
    passingScore: number;
    durationMinutes: number;
}

export interface AssessmentAttempt {
    id: string;
    userId: string;
    assessmentId: string;
    score?: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
    startedAt: string;
    completedAt?: string;
}

export interface LabSession {
    id: string;
    userId: string;
    environment: string; // e.g. "NODE-18" or "node-18"
    status: 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'TERMINATED' | 'FAILED';
    startedAt: string;
    expiresAt: string;
    instanceUrl?: string;
}

export type BatchStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'UPCOMING'; // UPCOMING is used in frontend logic sometimes

export interface Batch {
    id: string;
    name: string;
    programId: string;
    startDate: string; // ISO Date
    endDate: string;   // ISO Date
    status: BatchStatus;
}

export interface Enrollment {
    id: string;
    userId: string;
    batchId: string;
    status: 'ACTIVE' | 'DROPPED' | 'COMPLETED';
    enrolledAt: string;
}

// --- Mock Data Store ---

const STORAGE_KEY = '3ek_lms_mock_db_v1';

interface DBState {
    users: User[];
    assessments: Assessment[];
    attempts: AssessmentAttempt[];
    labSessions: LabSession[];
    batches: Batch[];
    enrollments: Enrollment[];
    initialized: boolean;
}

const initialState: DBState = {
    initialized: true,
    users: [
        { id: 'u1', name: 'Shuaib', email: 'shuaib@3ek.in', role: 'INSTRUCTOR', orgId: 'org1', avatar: 'https://ui-avatars.com/api/?name=Shuaib' },
        { id: 'u2', name: 'Student 1', email: 's1@3ek.in', role: 'LEARNER', orgId: 'org1', avatar: 'https://ui-avatars.com/api/?name=Student+1' },
    ],
    assessments: [
        { id: 'asm1', title: 'React Fundamentals Quiz', passingScore: 80, durationMinutes: 30 },
        { id: 'asm2', title: 'Node.js Backend Basics', passingScore: 75, durationMinutes: 45 },
    ],
    attempts: [],
    labSessions: [],
    batches: [
        { id: 'b1', name: 'Feb 2026 Cohort', programId: 'p1', startDate: '2026-02-01', endDate: '2026-05-01', status: 'PLANNED' }
    ],
    enrollments: [
        { id: 'e1', userId: 'u2', batchId: 'b1', status: 'ACTIVE', enrolledAt: new Date().toISOString() }
    ],
};

class LocalDB {
    private state: DBState = initialState;

    init() {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this.state = JSON.parse(stored);
        } else {
            this.save();
        }
    }

    private save() {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    // --- Accessors ---

    get users() {
        return {
            getAll: () => this.state.users,
            getById: (id: string) => this.state.users.find(u => u.id === id),
            create: (user: User) => {
                this.state.users.push(user);
                this.save();
                return user;
            }
        };
    }

    get assessments() {
        return {
            getAll: () => this.state.assessments,
            getById: (id: string) => this.state.assessments.find(a => a.id === id)
        };
    }

    get attempts() {
        return {
            getByUser: (userId: string) => this.state.attempts.filter(a => a.userId === userId),
            create: (attempt: AssessmentAttempt) => {
                this.state.attempts.push(attempt);
                this.save();
                return attempt;
            },
            update: (id: string, updates: Partial<AssessmentAttempt>) => {
                const idx = this.state.attempts.findIndex(a => a.id === id);
                if (idx !== -1) {
                    this.state.attempts[idx] = { ...this.state.attempts[idx], ...updates };
                    this.save();
                    return this.state.attempts[idx];
                }
                return null;
            }
        };
    }

    get labSessions() {
        return {
            getByUser: (userId: string) => this.state.labSessions.filter(s => s.userId === userId),
            create: (session: LabSession) => {
                this.state.labSessions.push(session);
                this.save();
                return session;
            },
            terminate: (id: string) => {
                const idx = this.state.labSessions.findIndex(s => s.id === id);
                if (idx !== -1) {
                    this.state.labSessions[idx].status = 'TERMINATED';
                    this.state.labSessions[idx].expiresAt = new Date().toISOString();
                    this.save();
                }
            }
        };
    }

    get batches() {
        return {
            getAll: () => this.state.batches,
            getById: (id: string) => this.state.batches.find(b => b.id === id),
            create: (batch: Batch) => {
                this.state.batches.push(batch);
                this.save();
                return batch;
            }
        };
    }

    get enrollments() {
        return {
            getByBatch: (batchId: string) => this.state.enrollments.filter(e => e.batchId === batchId),
            create: (enrollment: Enrollment) => {
                this.state.enrollments.push(enrollment);
                this.save();
                return enrollment;
            }
        };
    }
}

export const db = new LocalDB();
