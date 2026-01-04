
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'jibu@mphasis.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { org: true }
    });

    if (user) {
        console.log("User Found:", {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            orgId: user.orgId,
            orgName: user.org?.name
        });
    } else {
        console.log("User NOT Found:", email);
    }

    const allUsers = await prisma.user.findMany({ select: { email: true, orgId: true } });
    console.log("Total Users:", allUsers.length);
    // console.log(allUsers);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
