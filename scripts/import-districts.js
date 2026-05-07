const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const results = [];

fs.createReadStream(path.join(__dirname, 'districts.csv'))
  .pipe(
    csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase(),
    })
  )
  .on('data', (data) => {
    const email = (data.email || '').trim().toLowerCase();
    const district = Number.parseInt((data.district || '').trim(), 10);

    if (!email || Number.isNaN(district)) {
      return;
    }

    results.push({ email, district });
  })
  .on('end', async () => {
    try {
      console.log(`Parsed ${results.length} valid rows`);

      for (const row of results) {
        await prisma.userDistrictLookup.upsert({
          where: { email: row.email },
          update: { district: row.district },
          create: row,
        });
      }

      console.log('Import complete');
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  });