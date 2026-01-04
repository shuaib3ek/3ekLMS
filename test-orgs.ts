
import { getAllOrgs } from './src/actions/lms';
import { prisma } from './src/lib/prisma';

async function test() {
    try {
        console.log("Testing getAllOrgs...");
        const orgs = await getAllOrgs();
        console.log("Orgs found:", orgs);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
