import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.userStatus.upsert({
        where: { name: 'incomplete' },
        update: {},
        create: { name: 'incomplete' },
    });

    await prisma.userStatus.upsert({
        where: { name: 'active' },
        update: {},
        create: { name: 'active' },
    });

    await prisma.role.upsert({
        where: { name: 'user' },
        update: {},
        create: { name: 'user' },
    });
    await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: { name: 'admin' },
    });
    await prisma.role.upsert({
        where: { name: 'moderator' },
        update: {},
        create: { name: 'moderator' },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });