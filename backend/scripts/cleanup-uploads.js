const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const uploadsDir = path.join(__dirname, '..', 'uploads');

async function cleanupOrphanedFiles() {
  console.log('🧹 Iniciando limpieza de archivos huérfanos...');

  try {
    // Obtener todos los documentos de la base de datos
    const documents = await prisma.document.findMany({
      select: { filename: true }
    });

    const dbFilenames = new Set(documents.map(doc => doc.filename));

    // Leer archivos en la carpeta uploads
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Carpeta uploads no existe, creando...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    let orphanedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      if (!dbFilenames.has(file)) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        console.log(`🗑️  Eliminando archivo huérfano: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        
        fs.unlinkSync(filePath);
        orphanedCount++;
        totalSize += stats.size;
      }
    }

    console.log(`✅ Limpieza completada:`);
    console.log(`   - Archivos eliminados: ${orphanedCount}`);
    console.log(`   - Espacio liberado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupOrphanedFiles();
}

module.exports = { cleanupOrphanedFiles }; 