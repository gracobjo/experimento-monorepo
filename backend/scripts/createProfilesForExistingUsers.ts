import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to create profiles for existing users...');

  // Find all existing users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} existing users`);

  for (const user of users) {
    console.log(`Processing user: ${user.name} (${user.email}) - Role: ${user.role}`);

    // Check if user already has a profile
    if (user.role === Role.CLIENTE) {
      const existingClient = await prisma.client.findUnique({
        where: { userId: user.id }
      });

      if (!existingClient) {
        console.log(`Creating client profile for ${user.name}`);
        await prisma.client.create({
          data: {
            userId: user.id,
            dni: 'DNI' + user.id.slice(0, 8).toUpperCase(),
            phone: '600000000',
            address: 'Calle Falsa 123',
          },
        });
        console.log(`✓ Client profile created for ${user.name}`);
      } else {
        console.log(`Client profile already exists for ${user.name}`);
      }
    }

    if (user.role === Role.ABOGADO) {
      const existingLawyer = await prisma.lawyer.findUnique({
        where: { userId: user.id }
      });

      if (!existingLawyer) {
        console.log(`Creating lawyer profile for ${user.name}`);
        await prisma.lawyer.create({
          data: {
            userId: user.id,
            colegiado: 'LAW' + user.id.slice(0, 8).toUpperCase(),
            phone: '600000001',
            address: 'Avenida Legal 456',
          },
        });
        console.log(`✓ Lawyer profile created for ${user.name}`);
      } else {
        console.log(`Lawyer profile already exists for ${user.name}`);
      }
    }
  }

  console.log('Profile creation completed!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 