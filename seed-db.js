const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create spaces
  const spaces = [
    {
      name: 'Co-working Space',
      capacity: 20,
      description: 'Open workspace for collaboration and productivity'
    },
    {
      name: 'Lecture Room',
      capacity: 40,
      description: 'Large room with projector for presentations and lectures'
    },
    {
      name: 'Meeting Room',
      capacity: 10,
      description: 'Private room for meetings and discussions'
    }
  ];

  for (const space of spaces) {
    const exists = await prisma.space.findUnique({ where: { name: space.name } });
    if (!exists) {
      await prisma.space.create({ data: space });
      console.log('✅ Created space:', space.name);
    } else {
      console.log('⏭️  Space already exists:', space.name);
    }
  }

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@codershq.ae';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'CHQ',
        lastName: 'Admin',
        role: 'ADMIN'
      }
    });
    console.log('✅ Created admin user:', adminEmail);
  } else {
    console.log('⏭️  Admin user already exists:', adminEmail);
  }

  console.log('✅ Seeding completed!');
  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
