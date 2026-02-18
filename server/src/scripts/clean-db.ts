import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log('Cleaning data...');
  // We need to delete projects because they don't have workspaceIds
  // and we're making workspaceId required.
  // The client is currently generated from the OLD schema (without workspaceId),
  // so we can use it to delete projects.
  
  try {
     await prisma.project.deleteMany({});
     console.log('✅ All projects deleted.');
  } catch (error) {
    console.error('Error deleting projects:', error);
  }
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
