import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function isBcryptHash(password: string): boolean {
  // Un hash bcrypt típico empieza por $2a$, $2b$ o $2y$ y tiene 60 caracteres
  return /^(\$2[aby]\$)[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(password);
}

async function main() {
  const users = await prisma.user.findMany();
  let updatedCount = 0;

  for (const user of users) {
    if (!isBcryptHash(user.password)) {
      const hashed = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      console.log(`Contraseña encriptada para usuario: ${user.email}`);
      updatedCount++;
    } else {
      console.log(`Contraseña ya encriptada para usuario: ${user.email}`);
    }
  }

  console.log(`\nTotal de contraseñas actualizadas: ${updatedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 