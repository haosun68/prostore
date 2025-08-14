import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';

async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.product.createMany({ data: sampleData.products });
  
  // Only create users if sampleData.users is not empty
  if (sampleData.users.length > 0) {
    await prisma.user.createMany({ data: sampleData.users });
  }

  console.log('Database seeded successfully!');
}

main();