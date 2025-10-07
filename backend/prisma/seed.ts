import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create the three CHQ spaces
  const spaces = [
    {
      name: 'Co-working Space',
      capacity: 20,
      description: '2 tables, 10 seats each - Perfect for collaborative work',
    },
    {
      name: 'Lecture Room',
      capacity: 40,
      description: 'Ideal for talks, training sessions, and workshops',
    },
    {
      name: 'Meeting Room',
      capacity: 10,
      description: 'Small group meetings and mentoring sessions',
    },
  ];

  for (const space of spaces) {
    const existing = await prisma.space.findUnique({
      where: { name: space.name },
    });

    if (!existing) {
      await prisma.space.create({ data: space });
      console.log(`✅ Created space: ${space.name}`);
    } else {
      console.log(`ℹ️  Space already exists: ${space.name}`);
    }
  }

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@codershq.ae';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'CHQ',
        lastName: 'Admin',
        name: 'CHQ Admin',
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Created admin user: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
