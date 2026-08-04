const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: node scripts/import-seeded-users.js <csv-file>');
  process.exit(1);
}

const rows = [];

function normalize(value) {
  if (value === undefined || value === null) return null;

  const trimmed = String(value).trim();

  return trimmed.length ? trimmed : null;
}

async function run() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(csvPath))
      .pipe(csv())
      .on('data', (row) => {
        const cleanRow = {};

        for (const [key, value] of Object.entries(row)) {
          cleanRow[String(key).trim().replace(/^\uFEFF/, '')] = value;
        }

        rows.push(cleanRow);
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${rows.length} rows`);

          let created = 0;
          let updated = 0;

          for (const row of rows) {
            const gmin = normalize(row.gmin || row.GMIN);

            if (!gmin) {
              console.log('Skipping row with missing GMIN');
              continue;
            }

            const existing = await prisma.seededLoginUser.findUnique({
              where: { gmin },
            });

            const data = {
              firstName: normalize(row.firstName || row['First Name']),
              lastName: normalize(row.lastName || row['Last Name']),
              bac: normalize(row.bac || row.BAC) || '',
              gmin,
              email: normalize(row.email || row.Email) || '',
              dealer: normalize(row.dealer || row.Dealer),
              district: normalize(row.district || row.District),
              zone: normalize(row.zone || row.Zone),
              region: normalize(row.region || row.Region),
              jobRole: normalize(row.jobRole || row.JobRole || row['Job Role']),
              role: normalize(row.role || row.Role) || 'uploader',
              active:
                String(row.active || row.Active || 'true')
                  .toLowerCase()
                  .trim() !== 'false',
            };

            if (existing) {
              await prisma.seededLoginUser.update({
                where: { gmin },
                data,
              });

              updated++;
            } else {
              await prisma.seededLoginUser.create({
                data,
              });

              created++;
            }
          }

          console.log({
            created,
            updated,
            total: created + updated,
          });

          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });