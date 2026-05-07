const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function main() {
  try {
    const dbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL !== "undefined" 
      ? process.env.DATABASE_URL 
      : "file:./dev.db";
    const adapter = new PrismaLibSql({ url: dbUrl });
    
    // Explicitly pass adapter
    const prisma = new PrismaClient({ adapter });
    await prisma.$connect();
    console.log("Success: Prisma connected!");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
main();
