"use server";

import { prisma } from "@/lib/prisma";

export type AnalyticsSummary = {
    totalStudents: number;
    activeBatches: number;
    quizCompletions: number;
    topBatches: {
        id: string;
        name: string;
        studentCount: number;
    }[];
};

export async function getInstructorAnalyticsAction(userId: string): Promise<AnalyticsSummary> {
    try {
        // 1. Get Batches for Instructor
        const batches = await prisma.batch.findMany({
            where: {
                instructors: { some: { id: userId } }
            },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        const batchIds = batches.map(b => b.id);
        const totalStudents = batches.reduce((acc, b) => acc + b._count.students, 0);

        // 2. Count Passed Quizzes in these batches
        const passedQuizzes = await prisma.quizSubmission.count({
            where: {
                quiz: { batchId: { in: batchIds } },
                passed: true
            }
        });

        // 3. Top Batches
        const topBatches = batches
            .sort((a, b) => b._count.students - a._count.students)
            .slice(0, 4)
            .map(b => ({
                id: b.id,
                name: b.name,
                studentCount: b._count.students
            }));

        return {
            totalStudents,
            activeBatches: batches.length,
            quizCompletions: passedQuizzes,
            topBatches
        };

    } catch (e) {
        console.error("Get Analytics Error:", e);
        return {
            totalStudents: 0,
            activeBatches: 0,
            quizCompletions: 0,
            topBatches: []
        };
    }
}
