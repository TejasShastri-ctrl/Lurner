import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

/**
 * Mutual Friend Seeder
 * Ensures every relationship created exists in both directions.
 */
async function main() {
    console.log("🛠️ Seeding Mutual Social Relationships...");

    // 1. Ensure we have test users
    const userCount = await prisma.user.count();
    
    if (userCount < 3) {
        console.log("Creating test users...");
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        await prisma.user.createMany({
            data: [
                { name: "John Doe", email: "johndoe@mail.com", password: hashedPassword },
                { name: "Tejas", email: "tejas@mail.com", password: hashedPassword },
                { name: "TCS", email: "tcs@mail.com", password: hashedPassword },
            ],
            skipDuplicates: true
        });
    }

    const users = await prisma.user.findMany({ take: 3 });
    const [u1, u2, u3] = users;

    console.log(`Establishing links between: ${u1.name}, ${u2.name}, ${u3.name}`);

    // 2. Define Mutual Pairs
    // We want a full triangle: (1,2), (2,3), (1,3)
    const pairs = [
        [u1.id, u2.id],
        [u2.id, u3.id],
        [u1.id, u3.id]
    ];

    for (const [a, b] of pairs) {
        // Create A -> B and B -> A
        const relationships = [
            { followerId: a, followingId: b },
            { followerId: b, followingId: a }
        ];

        for (const rel of relationships) {
            await prisma.follows.upsert({
                where: {
                    followerId_followingId: {
                        followerId: rel.followerId,
                        followingId: rel.followingId
                    }
                },
                update: {},
                create: rel
            });
        }
        console.log(`✅ ${a} <---> ${b} are now mutual friends`);
    }

    console.log("\n🚀 Mutual Social Seeding Complete!");
    console.log("Test Accounts (Password: password123):");
    users.forEach(u => console.log(`- ${u.name}: ${u.email}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
