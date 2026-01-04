import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Sessions...');

    // 1. Find the Batch
    const batch = await prisma.batch.findFirst({
        where: { name: 'Feb 2026 Cohort' },
        include: { program: true }
    });

    if (!batch) {
        console.error('❌ Batch not found. Run main seed first.');
        return;
    }

    console.log(`Found Batch: ${batch.name} (${batch.id})`);

    // 2. Define Sessions (Mocking a 5-day bootcamp)
    // We will space them out starting from Batch Start Date
    const startDate = new Date(batch.startDate);

    const sessions = [
        { day: 0, title: "Day 1: VPC Fundamentals & Addressing", topicId: "t1" },
        { day: 1, title: "Day 2: Hybrid Connectivity (VPN/DX)", topicId: "t2" },
        { day: 2, title: "Day 3: Network Security & Transit Gateway", topicId: "t3" },
        { day: 3, title: "Day 4: Load Balancing & Route53", topicId: "t4" },
        { day: 4, title: "Day 5: Capstone Project", topicId: "t5" }
    ];

    for (const s of sessions) {
        const sessionStart = new Date(startDate);
        sessionStart.setDate(startDate.getDate() + s.day);
        sessionStart.setHours(9, 0, 0, 0); // 9 AM

        const sessionEnd = new Date(sessionStart);
        sessionEnd.setHours(17, 0, 0, 0); // 5 PM

        await prisma.session.create({
            data: {
                batchId: batch.id,
                title: s.title,
                topicId: s.topicId,
                startTime: sessionStart,
                endTime: sessionEnd,
                meetingLink: "https://zoom.us/j/123456789" // Mock link
            }
        });
        console.log(`✅ Created Session: ${s.title}`);
    }

    console.log('🌱 Session Seeding Finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
