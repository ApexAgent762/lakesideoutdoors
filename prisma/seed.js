const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('Lakeside2026', 10);
  await prisma.user.upsert({
    where: { email: 'dalton@lakesideoutdoors.com' },
    update: { username: 'daltonkesti24' },
    create: {
      name: 'Dalton Kesti',
      email: 'dalton@lakesideoutdoors.com',
      username: 'daltonkesti24',
      password: hashed,
      role: 'OWNER'
    }
  });

  const services = [
    { name: 'Rock Installation', description: 'Labor and poly/fabric installation', unit: 'ton', unitPrice: 155, notes: 'Add separate line item for rock material cost' },
    { name: 'Rock Material Cost', description: 'Rock material cost', unit: 'ton', unitPrice: 0, notes: 'Enter actual rock cost per ton' },
    { name: 'Rock Removal', description: 'Rock removal and hauling', unit: 'ton', unitPrice: 215 },
    { name: 'Mulch Installation', description: 'Labor and fabric installation', unit: 'yard', unitPrice: 95, notes: 'Add separate line item for mulch material cost' },
    { name: 'Mulch Material Cost', description: 'Mulch material cost', unit: 'yard', unitPrice: 0, notes: 'Enter actual mulch cost per yard' },
    { name: 'Mulch Removal', description: 'Mulch removal and hauling', unit: 'yard', unitPrice: 100 },
    { name: 'Plastic Edging Installation', description: 'Professional plastic edging install', unit: 'piece', unitPrice: 105 },
    { name: 'Sod Removal', description: 'Sod removal and hauling', unit: 'sq ft', unitPrice: 1.40 },
    { name: 'Sod Installation', description: 'Includes sod material', unit: 'sq ft', unitPrice: 1.15 },
    { name: 'Drainage System Installation', description: 'Includes basin and downspout adapter', unit: 'ft', unitPrice: 18 },
    { name: 'Spring Cleanup', description: 'Full property spring cleanup', unit: 'job', unitPrice: 0, notes: 'Custom quote per job' },
    { name: 'Fall Cleanup', description: 'Full property fall cleanup', unit: 'job', unitPrice: 0, notes: 'Custom quote per job' },
    { name: 'Brush Clearing', description: 'Brush and overgrowth clearing', unit: 'job', unitPrice: 0, notes: 'Custom quote per job' },
    { name: 'Tree Removal', description: 'Tree removal and hauling', unit: 'job', unitPrice: 0, notes: 'Custom quote per job' },
    { name: 'Aeration', description: 'Lawn aeration service', unit: 'job', unitPrice: 0, notes: 'Custom quote per job' },
    { name: 'Dethatching', description: 'Lawn dethatching service', unit: 'job', unitPrice: 0, notes: 'Custom quote per job' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service
    });
  }

  console.log('✅ Dalton Kesti owner account updated with username');
  console.log('✅ Pricing database updated');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
