"use server";

import { prisma } from "@/lib/prisma";
import { QuestionType } from "@prisma/client";

export type CreateQuizInput = {
    title: string;
    description?: string;
    batchId: string;
    questions: {
        text: string;
        type: QuestionType;
        points: number;
        options: {
            text: string;
            isCorrect: boolean;
        }[];
    }[];
};

export async function createQuizAction(input: CreateQuizInput) {
    try {
        const quiz = await prisma.quiz.create({
            data: {
                title: input.title,
                description: input.description,
                batchId: input.batchId,
                questions: {
                    create: input.questions.map(q => ({
                        text: q.text,
                        type: q.type,
                        points: q.points,
                        options: {
                            create: q.options
                        }
                    }))
                }
            }
        });
        return { success: true, quizId: quiz.id };
    } catch (e: any) {
        console.error("Create Quiz Error:", e);
        return { success: false, error: "Failed to create quiz." };
    }
}

export async function getQuizAction(quizId: string) {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: { options: true }
                }
            }
        });
        if (!quiz) return null;

        // Remove isCorrect from options for filtering if needed (security), 
        // but for now we assume Client trusted or rendered server-side form.
        return quiz;
    } catch (e) {
        return null;
    }
}

export async function submitQuizAction(userId: string, quizId: string, answers: Record<string, string>) {
    // answers: { questionId: optionId }
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { include: { options: true } } }
        });

        if (!quiz) throw new Error("Quiz not found");

        let score = 0;
        let totalPoints = 0;

        for (const q of quiz.questions) {
            totalPoints += q.points;
            const selectedOptionId = answers[q.id];

            // Find if correct
            const correctOption = q.options.find(o => o.isCorrect);
            if (correctOption && correctOption.id === selectedOptionId) {
                score += q.points;
            }
        }

        // Pass threshold 70%
        const passed = (score / totalPoints) >= 0.7;

        await prisma.quizSubmission.create({
            data: {
                userId,
                quizId,
                score,
                passed,
            }
        });

        return { success: true, score, totalPoints, passed };

    } catch (e: any) {
        console.error("Submit Quiz Error:", e);
        return { success: false, error: e.message };
    }
}

export async function getInstructorQuizzesAction(userId: string) {
    try {
        // Find batches instructed by user
        const instructor = await prisma.user.findUnique({
            where: { id: userId },
            include: { instructedBatches: { select: { id: true } } }
        });

        if (!instructor) return [];

        const batchIds = instructor.instructedBatches.map(b => b.id);

        const quizzes = await prisma.quiz.findMany({
            where: {
                batchId: { in: batchIds }
            },
            include: {
                batch: { select: { name: true } },
                _count: { select: { questions: true, submissions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return quizzes.map(q => ({
            ...q,
            createdAt: q.createdAt.toISOString()
        }));
    } catch (e) {
        console.error("Get Instructor Quizzes Error:", e);
        return [];
    }
}

export async function getStudentQuizzesAction(userId: string) {
    try {
        // Did user enroll in any batches?
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            select: { batchId: true }
        });

        const batchIds = enrollments.map(e => e.batchId);

        const quizzes = await prisma.quiz.findMany({
            where: {
                batchId: { in: batchIds }
            },
            include: {
                batch: { select: { name: true } },
                _count: { select: { questions: true } },
                submissions: {
                    where: { userId },
                    select: { score: true, passed: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform for client
        return quizzes.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            batchName: q.batch.name,
            questionCount: q._count.questions,
            status: q.submissions.length > 0 ? (q.submissions[0].passed ? "PASSED" : "FAILED") : "PENDING",
            score: q.submissions.length > 0 ? q.submissions[0].score : null
        }));

    } catch (e) {
        console.error("Get Student Quizzes Error:", e);
        return [];
    }
}

export async function getCertificateAction(userId: string, quizId: string) {
    try {
        const submission = await prisma.quizSubmission.findFirst({
            where: { userId, quizId, passed: true },
            include: {
                quiz: { select: { title: true } },
                user: { select: { name: true } }
            }
        });

        if (!submission) return null;

        return {
            studentName: submission.user.name,
            quizTitle: submission.quiz.title,
            completedAt: submission.createdAt.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        };
    } catch (e) {
        console.error("Get Certificate Error:", e);
        return null;
    }
}
