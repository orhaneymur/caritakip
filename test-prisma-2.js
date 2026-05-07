const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function main() {
  try {
    const libsql = createClient({ url: process.env.DATABASE_URL || "file:./dev.db" });
    const adapter = new PrismaLibSQL(libsql);
    const prisma = new PrismaClient({ adapter });
    await prisma.$connect();
    console.log("Success!");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
main();
