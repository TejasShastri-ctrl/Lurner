import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding database with SQL challenges...");

    // Clear existing data (order matters because of FK constraints)
    await prisma.userQuestionProgress.deleteMany();
    await prisma.contestParticipant.deleteMany();
    await prisma.contestQuestion.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.follows.deleteMany();
    await prisma.question.deleteMany();
    await prisma.tag.deleteMany();

    // Create tags
    const tagMap = {};

    const tags = ["SELECT", "AGGREGATION", "FILTERING"];

    for (const name of tags) {
        const tag = await prisma.tag.create({
            data: { name }
        });
        tagMap[name] = tag.id;
    }

    const questions = [
        {
            title: "Employee Roster",
            description: "Retrieve all employee details to verify the current headcount.",
            difficulty: "EASY",
            tagId: tagMap["SELECT"],
            initSql: `
                CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
                INSERT INTO employees (name, department, salary) VALUES 
                ('Alice', 'Engineering', 90000),
                ('Bob', 'Sales', 70000),
                ('Charlie', 'Engineering', 95000),
                ('David', 'Marketing', 65000);
            `,
            dbTableName: "employees",
            expectedOutput: [
                { id: 1, name: "Alice", department: "Engineering", salary: 90000 },
                { id: 2, name: "Bob", department: "Sales", salary: 70000 },
                { id: 3, name: "Charlie", department: "Engineering", salary: 95000 },
                { id: 4, name: "David", department: "Marketing", salary: 65000 }
            ]
        },
        {
            title: "Department Salaries",
            description: "Calculate the total salary budget for the 'Engineering' department.",
            difficulty: "MEDIUM",
            tagId: tagMap["AGGREGATION"],
            initSql: `
                CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
                INSERT INTO employees (name, department, salary) VALUES 
                ('Alice', 'Engineering', 90000),
                ('Bob', 'Sales', 70000),
                ('Charlie', 'Engineering', 95000),
                ('David', 'Marketing', 65000);
            `,
            dbTableName: "employees",
            expectedOutput: [
                { total_salary: 185000 }
            ]
        },
        {
            title: "High Earners",
            description: "Find all employees who earn more than 80,000.",
            difficulty: "EASY",
            tagId: tagMap["FILTERING"],
            initSql: `
                CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER, test text, anothertest text, longtest text, evenlongertext text);
                INSERT INTO employees (name, department, salary, test, anothertest, longtest, evenlongertext) VALUES 
                ('Alice', 'Engineering', 90000, 'test', 'anothertest', 'longtest', 'evenlongertext'),
                ('Bob', 'Sales', 70000, 'test', 'anothertest', 'longtest', 'evenlongertext'),
                ('Charlie', 'Engineering', 95000, 'test', 'anothertest', 'longtest', 'evenlongertext'),
                ('David', 'Marketing', 65000, 'test', 'anothertest', 'longtest', 'evenlongertext');
            `,
            dbTableName: "employees",
            expectedOutput: [
                { id: 1, name: "Alice", department: "Engineering", salary: 90000 },
                { id: 3, name: "Charlie", department: "Engineering", salary: 95000 }
            ]
        }
    ];

    for (const q of questions) {
        await prisma.question.create({ data: q });
    }

    console.log("Seeding complete 🚀");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });