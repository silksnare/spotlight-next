import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const [, , email, role] = process.argv;

if (!email || !role) {
  console.error('Usage: npx tsx scripts/set-user-role.ts user@example.com admin');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error(`User not found: ${email}`);
  await prisma.userRole.createMany({ data: [{ userId: user.id, role }], skipDuplicates: true });
  const roles = await prisma.userRole.findMany({ where: { userId: user.id }, orderBy: { role: 'asc' } });
  console.log(`Roles for ${user.email}: ${roles.map((r) => r.role).join(', ')}`);
}

main().finally(async () => prisma.$disconnect());
