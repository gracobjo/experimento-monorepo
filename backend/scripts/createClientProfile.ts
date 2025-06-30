// backend/scripts/createClientProfile.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // CLIENTES
  const clientes = await prisma.user.findMany({ where: { role: Role.CLIENTE } });
  for (const user of clientes) {
    const existing = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!existing) {
      // Genera un dni dummy único (puedes personalizar esto)
      const dni = 'DUMMY' + user.id.slice(0, 8).toUpperCase();
      await prisma.client.create({
        data: {
          userId: user.id,
          dni,
          phone: null,
          address: null,
        },
      });
      console.log(`Creado perfil client para usuario ${user.email} (dni: ${dni})`);
    }
  }
  // ABOGADOS
  const abogados = await prisma.user.findMany({ where: { role: Role.ABOGADO } });
  for (const user of abogados) {
    const existing = await prisma.lawyer.findUnique({ where: { userId: user.id } });
    if (!existing) {
      // Genera un colegiado dummy único
      const colegiado = 'LAW' + user.id.slice(0, 8).toUpperCase();
      await prisma.lawyer.create({
        data: {
          userId: user.id,
          colegiado,
          phone: null,
          address: null,
        },
      });
      console.log(`Creado perfil lawyer para usuario ${user.email} (colegiado: ${colegiado})`);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});