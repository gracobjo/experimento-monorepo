import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar tablas de facturas y provisiones de fondos
  await prisma.provisionFondos.deleteMany();
  await prisma.invoice.deleteMany();

  // Crear usuarios de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@despacho.com' },
    update: {},
    create: {
      email: 'admin@despacho.com',
      name: 'Administrador del Sistema',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Crear abogados
  const lawyer1 = await prisma.user.upsert({
    where: { email: 'abogado1@despacho.com' },
    update: {},
    create: {
      email: 'abogado1@despacho.com',
      name: 'Dr. Juan Pérez',
      password: hashedPassword,
      role: 'ABOGADO',
    },
  });

  const lawyer2 = await prisma.user.upsert({
    where: { email: 'abogado2@despacho.com' },
    update: {},
    create: {
      email: 'abogado2@despacho.com',
      name: 'Dra. María García',
      password: hashedPassword,
      role: 'ABOGADO',
    },
  });

  // Crear clientes
  const client1 = await prisma.user.upsert({
    where: { email: 'cliente1@email.com' },
    update: {},
    create: {
      email: 'cliente1@email.com',
      name: 'Carlos López',
      password: hashedPassword,
      role: 'CLIENTE',
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: 'cliente2@email.com' },
    update: {},
    create: {
      email: 'cliente2@email.com',
      name: 'Ana Rodríguez',
      password: hashedPassword,
      role: 'CLIENTE',
    },
  });

  // Crear perfiles de clientes
  const clientProfile1 = await prisma.client.upsert({
    where: { userId: client1.id },
    update: {},
    create: {
      userId: client1.id,
      dni: '12345678A',
      phone: '+34 600 123 456',
      address: 'Calle Mayor 123, Madrid',
    },
  });

  const clientProfile2 = await prisma.client.upsert({
    where: { userId: client2.id },
    update: {},
    create: {
      userId: client2.id,
      dni: '87654321B',
      phone: '+34 600 654 321',
      address: 'Avenida Principal 456, Barcelona',
    },
  });

  // Crear expedientes de ejemplo
  const expediente1 = await prisma.expediente.upsert({
    where: { id: 'exp-001' },
    update: {},
    create: {
      id: 'exp-001',
      title: 'Contrato de Compraventa de Vivienda',
      description: 'Contrato de compraventa de vivienda ubicada en Madrid. El cliente desea adquirir una propiedad de 120m².',
      status: 'ABIERTO',
      clientId: clientProfile1.id,
      lawyerId: lawyer1.id,
    },
  });

  const expediente2 = await prisma.expediente.upsert({
    where: { id: 'exp-002' },
    update: {},
    create: {
      id: 'exp-002',
      title: 'Demanda Laboral por Despido Improcedente',
      description: 'Demanda contra empresa por despido improcedente. El cliente trabajó durante 5 años en la empresa.',
      status: 'EN_PROCESO',
      clientId: clientProfile2.id,
      lawyerId: lawyer2.id,
    },
  });

  const expediente3 = await prisma.expediente.upsert({
    where: { id: 'exp-003' },
    update: {},
    create: {
      id: 'exp-003',
      title: 'Divorcio Contencioso',
      description: 'Proceso de divorcio contencioso con bienes en disputa. Caso complejo con múltiples propiedades.',
      status: 'CERRADO',
      clientId: clientProfile1.id,
      lawyerId: lawyer1.id,
    },
  });

  // Crear documentos de ejemplo
  await prisma.document.upsert({
    where: { id: 'doc-001' },
    update: {},
    create: {
      id: 'doc-001',
      expedienteId: expediente1.id,
      filename: 'contrato_compraventa.pdf',
      originalName: 'contrato_compraventa.pdf',
      fileUrl: 'https://example.com/documents/contrato_compraventa.pdf',
      fileSize: 123456, // tamaño en bytes (puedes poner un número realista)
      mimeType: 'application/pdf',
      uploadedBy: lawyer1.id, // o el id del usuario que sube el documento
      uploadedAt: new Date(),
      description: 'Contrato de compraventa',
    },
  });
  
  await prisma.document.upsert({
    where: { id: 'doc-002' },
    update: {},
    create: {
      id: 'doc-002',
      expedienteId: expediente2.id,
      filename: 'demanda_laboral.pdf',
      originalName: 'demanda_laboral.pdf',
      fileUrl: 'https://example.com/documents/demanda_laboral.pdf',
      fileSize: 234567, // tamaño en bytes
      mimeType: 'application/pdf',
      uploadedBy: lawyer2.id,
      uploadedAt: new Date(),
      description: 'Demanda laboral',
    },
  });

  // Crear citas de ejemplo
  await prisma.appointment.upsert({
    where: { id: 'app-001' },
    update: {},
    create: {
      id: 'app-001',
      clientId: clientProfile1.id,
      lawyerId: lawyer1.id,
      date: new Date('2024-02-15T10:00:00Z'),
      location: 'Oficina Principal - Sala de Reuniones',
      notes: 'Revisión del contrato de compraventa y documentación necesaria.',
    },
  });

  await prisma.appointment.upsert({
    where: { id: 'app-002' },
    update: {},
    create: {
      id: 'app-002',
      clientId: clientProfile2.id,
      lawyerId: lawyer2.id,
      date: new Date('2024-02-16T14:00:00Z'),
      location: 'Oficina Principal - Sala de Reuniones',
      notes: 'Seguimiento de la demanda laboral y preparación para la audiencia.',
    },
  });

  // Crear tareas de ejemplo
  await prisma.task.upsert({
    where: { id: 'task-001' },
    update: {},
    create: {
      id: 'task-001',
      title: 'Revisar contrato de compraventa',
      description: 'Revisar y corregir el contrato de compraventa de la vivienda en Madrid',
      dueDate: new Date('2024-02-20T17:00:00Z'),
      priority: 'ALTA',
      status: 'PENDIENTE',
      expedienteId: expediente1.id,
      assignedTo: lawyer1.id,
      createdBy: lawyer1.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-002' },
    update: {},
    create: {
      id: 'task-002',
      title: 'Preparar demanda laboral',
      description: 'Preparar la demanda laboral por despido improcedente',
      dueDate: new Date('2024-02-18T12:00:00Z'),
      priority: 'URGENTE',
      status: 'EN_PROGRESO',
      expedienteId: expediente2.id,
      assignedTo: lawyer2.id,
      createdBy: lawyer2.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-003' },
    update: {},
    create: {
      id: 'task-003',
      title: 'Contactar cliente para actualización',
      description: 'Llamar al cliente para informar sobre el progreso del caso',
      dueDate: new Date('2024-02-15T16:00:00Z'),
      priority: 'MEDIA',
      status: 'COMPLETADA',
      expedienteId: expediente3.id,
      assignedTo: lawyer1.id,
      createdBy: lawyer1.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-004' },
    update: {},
    create: {
      id: 'task-004',
      title: 'Revisar documentación del divorcio',
      description: 'Revisar toda la documentación presentada para el proceso de divorcio',
      dueDate: new Date('2024-02-25T10:00:00Z'),
      priority: 'BAJA',
      status: 'PENDIENTE',
      expedienteId: expediente3.id,
      assignedTo: lawyer1.id,
      createdBy: lawyer1.id,
    },
  });

  // Crear facturas y provisiones de fondos para cada abogado
  const abogados = [lawyer1, lawyer2];
  const clientes = [client1, client2];
  const expedientes = [expediente1, expediente2, expediente3];

  for (let i = 0; i < abogados.length; i++) {
    for (let j = 0; j < 3; j++) {
      const year = new Date().getFullYear();
      const emisor = abogados[i];
      const receptor = clientes[j % clientes.length];
      // Buscar un expediente que pertenezca al cliente receptor
      const expediente = expedientes.find(e => e.clientId === receptor.id);
      if (!emisor?.id || !receptor?.id || !expediente?.id) {
        console.warn('Datos faltantes para crear factura/provisión:', { emisor, receptor, expediente });
        continue;
      }
      const numeroFactura = `fac-${year}-${(i * 3 + j + 1).toString().padStart(4, '0')}`;
      const factura = await prisma.invoice.create({
        data: {
          numeroFactura,
          fechaFactura: new Date(),
          tipoFactura: 'F',
          emisorId: emisor.id,
          receptorId: receptor.id,
          expedienteId: expediente.id,
          importeTotal: 1000 + j * 100,
          baseImponible: 826.45 + j * 80,
          cuotaIVA: 173.55 + j * 20,
          tipoIVA: 21.0,
          regimenIvaEmisor: 'General',
          claveOperacion: '01',
          metodoPago: 'Transferencia',
          fechaOperacion: new Date(),
          estado: 'emitida',
        },
      });
      console.log('Creando provisión de fondos para:', {
        clientId: receptor.id,
        expedienteId: expediente.id,
        invoiceId: factura.id,
      });
      await prisma.provisionFondos.create({
        data: {
          clientId: receptor.id,
          expedienteId: expediente.id,
          invoiceId: factura.id,
          amount: 500 + j * 50,
          date: new Date(),
          description: `Provisión de fondos para factura ${numeroFactura}`,
        },
      });
    }
  }

  // Parámetros globales iniciales
  await prisma.parametro.upsert({
    where: { clave: 'año_fiscal' },
    update: { valor: '2025' },
    create: { clave: 'año_fiscal', valor: '2025', etiqueta: 'Año Fiscal', tipo: 'number' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'tipo_impuesto' },
    update: { valor: 'IVA' },
    create: { clave: 'tipo_impuesto', valor: 'IVA', etiqueta: 'Tipo de Impuesto', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'valor_impuesto' },
    update: { valor: '21.0' },
    create: { clave: 'valor_impuesto', valor: '21.0', etiqueta: 'Porcentaje IVA', tipo: 'number' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'tipo_retencion' },
    update: { valor: 'IRPF' },
    create: { clave: 'tipo_retencion', valor: 'IRPF', etiqueta: 'Tipo de Retención', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'valor_retencion' },
    update: { valor: '15.0' },
    create: { clave: 'valor_retencion', valor: '15.0', etiqueta: 'Porcentaje Retención', tipo: 'number' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'nombre_firmante' },
    update: { valor: 'Dr. Juan Pérez' },
    create: { clave: 'nombre_firmante', valor: 'Dr. Juan Pérez', etiqueta: 'Nombre Firmante', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'firma_digital' },
    update: { valor: '' },
    create: { clave: 'firma_digital', valor: '', etiqueta: 'Firma Digital (Base64)', tipo: 'image' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'cuenta_bancaria_default' },
    update: { valor: 'ES12 3456 7890 1234 5678 9012' },
    create: { clave: 'cuenta_bancaria_default', valor: 'ES12 3456 7890 1234 5678 9012', etiqueta: 'Cuenta Bancaria Default', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'nombre_despacho' },
    update: { valor: 'Despacho Legal Pérez & García' },
    create: { clave: 'nombre_despacho', valor: 'Despacho Legal Pérez & García', etiqueta: 'Nombre del Despacho', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'direccion_despacho' },
    update: { valor: 'Calle Mayor 123, Madrid' },
    create: { clave: 'direccion_despacho', valor: 'Calle Mayor 123, Madrid', etiqueta: 'Dirección del Despacho', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'email_contacto' },
    update: { valor: 'info@despacho.com' },
    create: { clave: 'email_contacto', valor: 'info@despacho.com', etiqueta: 'Email de Contacto', tipo: 'string' },
  });
  await prisma.parametro.upsert({
    where: { clave: 'telefono_contacto' },
    update: { valor: '+34 600 123 456' },
    create: { clave: 'telefono_contacto', valor: '+34 600 123 456', etiqueta: 'Teléfono de Contacto', tipo: 'string' },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📋 Datos creados:');
  console.log('- 1 Administrador');
  console.log('- 2 Abogados');
  console.log('- 2 Clientes');
  console.log('- 3 Expedientes');
  console.log('- 2 Documentos');
  console.log('- 2 Citas');
  console.log('- 4 Tareas');
  
  console.log('\n🔑 Credenciales de acceso:');
  console.log('Admin: admin@despacho.com / password123');
  console.log('Abogado 1: abogado1@despacho.com / password123');
  console.log('Abogado 2: abogado2@despacho.com / password123');
  console.log('Cliente 1: cliente1@email.com / password123');
  console.log('Cliente 2: cliente2@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 