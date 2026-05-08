const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  await prisma.service.deleteMany({
    where: {
      name: { in: ["Aeration", "Brush Clearing", "Fall Cleanup", "Spring Cleanup", "Dethatching"] }
    }
  });
  console.log("Services deleted");
}

main().catch(console.error).finally(() => prisma.$disconnect());
