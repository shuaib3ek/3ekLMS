import { PrismaClient, Role, EnrollmentStatus, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create Default Organization
    const org = await prisma.organization.upsert({
        where: { domain: '3ek.in' },
        update: {},
        create: {
            name: 'ThreeEK Academy',
            domain: '3ek.in',
            createdAt: new Date(),
        },
    });
    console.log('✅ Organization:', org.name);

    // 2. Create Super Admin
    const adminEmail = 'admin@3ek.in';
    const admin = await prisma.user.upsert({
        where: { email_orgId: { email: adminEmail, orgId: org.id } },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: 'password123', // In real app, hash this!
            role: Role.SUPER_ADMIN,
            orgId: org.id,
        },
    });
    console.log('✅ Admin User:', admin.email);

    // 3. Create Learner
    const learnerEmail = 'student@3ek.in';
    const learner = await prisma.user.upsert({
        where: { email_orgId: { email: learnerEmail, orgId: org.id } },
        update: {},
        create: {
            email: learnerEmail,
            name: 'Test Student',
            password: 'password123',
            role: Role.LEARNER,
            orgId: org.id,
        },
    });
    console.log('✅ Learner:', learner.email);

    // 4. Create Program (Content)
    const curriculum = [
        {
            module: 'Frontend Mastery',
            topics: [
                { id: 't1', title: 'React Fundamentals', type: 'VIDEO' },
                { id: 't2', title: 'Hooks & State', type: 'LAB' }
            ]
        }
    ];

    const program = await prisma.program.create({
        data: {
            title: 'Full Stack Engineering Bootcamp',
            orgId: org.id,
            curriculum: curriculum,
        }
    }); // Note: Using create usually, but for idempotency better to check first. 
    // For MVP seed, we might just letting it create multiple programs is fine or we can delete all first.
    // Let's keep it simple: We won't delete, we just add.

    console.log('✅ Program:', program.title);

    // 5. Create Batch
    const batch = await prisma.batch.create({
        data: {
            name: 'Feb 2026 Cohort',
            programId: program.id,
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-05-30'),
            instructors: {
                connect: [{ id: admin.id }] // Support logic: Admin is often instructor in MVP
            }
        }
    });
    console.log('✅ Batch:', batch.name);

    // 6. Enroll Student
    await prisma.enrollment.create({
        data: {
            userId: learner.id,
            batchId: batch.id,
            status: EnrollmentStatus.ACTIVE
        }
    });
    console.log('✅ Enrolled student in batch');

    console.log('🌱 Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
