import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.phase.upsert({
    where: { key: 'upload' },
    update: {
      label: 'Upload',
      startsAt: new Date('2026-04-01T00:00:00-05:00'),
      endsAt: new Date('2026-05-02T23:59:59-05:00'),
    },
    create: {
      key: 'upload',
      label: 'Upload',
      startsAt: new Date('2026-04-01T00:00:00-05:00'),
      endsAt: new Date('2026-05-02T23:59:59-05:00'),
      isActive: false,
    },
  });

  await prisma.phase.upsert({
    where: { key: 'judge_round_1' },
    update: {
      label: 'Judging Round 1',
      startsAt: new Date('2026-06-02T00:00:00-05:00'),
      endsAt: new Date('2026-06-15T23:59:59-05:00'),
    },
    create: {
      key: 'judge_round_1',
      label: 'Judging Round 1',
      startsAt: new Date('2026-06-02T00:00:00-05:00'),
      endsAt: new Date('2026-06-15T23:59:59-05:00'),
      isActive: false,
    },
  });

  await prisma.phase.upsert({
    where: { key: 'judge_round_2' },
    update: {
      label: 'Judging Round 2',
      startsAt: new Date('2026-06-16T00:00:00-05:00'),
      endsAt: new Date('2026-06-30T23:59:59-05:00'),
    },
    create: {
      key: 'judge_round_2',
      label: 'Judging Round 2',
      startsAt: new Date('2026-06-16T00:00:00-05:00'),
      endsAt: new Date('2026-06-30T23:59:59-05:00'),
      isActive: false,
    },
  });

  console.log('Phase dates updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });