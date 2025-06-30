import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureUser(email: string, name: string, role: Role, password: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name, role, password },
    });
    console.log(`Usuario creado: ${email}`);
  }
  return user;
}

async function ensureClientProfile(user: any, dni: string, phone: string, address: string) {
  let profile = await prisma.client.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.client.create({
      data: { userId: user.id, dni, phone, address },
    });
    console.log(`Perfil de cliente creado para: ${user.email}`);
  }
  return profile;
}

async function main() {
  // Contraseña encriptada por defecto (password123)
  const defaultHash = '$2b$10$wQvQnQw6Qw6Qw6Qw6Qw6QeQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6';

  // Asegurar usuarios y perfiles
  const admin = await ensureUser('admin@despacho.com', 'Administrador del Sistema', Role.ADMIN, defaultHash);
  const lawyer1 = await ensureUser('abogado1@despacho.com', 'Dr. Juan Pérez', Role.ABOGADO, defaultHash);
  const lawyer2 = await ensureUser('abogado2@despacho.com', 'Dra. María García', Role.ABOGADO, defaultHash);
  const client1 = await ensureUser('cliente1@email.com', 'Carlos López', Role.CLIENTE, defaultHash);
  const client2 = await ensureUser('cliente2@email.com', 'Ana Rodríguez', Role.CLIENTE, defaultHash);

  const clientProfile1 = await ensureClientProfile(client1, '12345678A', '+34 600 123 456', 'Calle Mayor 123, Madrid');
  const clientProfile2 = await ensureClientProfile(client2, '87654321B', '+34 600 654 321', 'Avenida Principal 456, Barcelona');

  // Crear expedientes (mínimo 5)
  const expedientes = [
    { id: 'exp-001', title: 'Contrato de Compraventa de Vivienda', description: 'Contrato de compraventa de vivienda ubicada en Madrid.', status: 'ABIERTO', clientId: clientProfile1.id, lawyerId: lawyer1.id },
    { id: 'exp-002', title: 'Demanda Laboral', description: 'Demanda contra empresa por despido improcedente.', status: 'EN_PROCESO', clientId: clientProfile2.id, lawyerId: lawyer2.id },
    { id: 'exp-003', title: 'Divorcio Contencioso', description: 'Divorcio con bienes en disputa.', status: 'CERRADO', clientId: clientProfile1.id, lawyerId: lawyer1.id },
    { id: 'exp-004', title: 'Herencia Familiar', description: 'Gestión de herencia y reparto de bienes familiares.', status: 'ABIERTO', clientId: clientProfile2.id, lawyerId: lawyer2.id },
    { id: 'exp-005', title: 'Reclamación de Deuda', description: 'Reclamación judicial de deuda pendiente.', status: 'EN_PROCESO', clientId: clientProfile1.id, lawyerId: lawyer1.id },
  ];
  for (const exp of expedientes) {
    await prisma.expediente.upsert({ where: { id: exp.id }, update: {}, create: { ...exp, status: exp.status as any } });
  }

  // Crear documentos (mínimo 5)
  const documentos = [
    { id: 'doc-001', expedienteId: 'exp-001', filename: 'contrato_compraventa.pdf', originalName: 'contrato_compraventa.pdf', fileUrl: 'https://example.com/documents/contrato_compraventa.pdf', fileSize: 123456, mimeType: 'application/pdf', uploadedBy: lawyer1.id, description: 'Contrato de compraventa' },
    { id: 'doc-002', expedienteId: 'exp-002', filename: 'demanda_laboral.pdf', originalName: 'demanda_laboral.pdf', fileUrl: 'https://example.com/documents/demanda_laboral.pdf', fileSize: 234567, mimeType: 'application/pdf', uploadedBy: lawyer2.id, description: 'Demanda laboral' },
    { id: 'doc-003', expedienteId: 'exp-004', filename: 'herencia_familiar.pdf', originalName: 'herencia_familiar.pdf', fileUrl: 'https://example.com/documents/herencia_familiar.pdf', fileSize: 345678, mimeType: 'application/pdf', uploadedBy: lawyer2.id, description: 'Documentación de herencia' },
    { id: 'doc-004', expedienteId: 'exp-005', filename: 'reclamacion_deuda.pdf', originalName: 'reclamacion_deuda.pdf', fileUrl: 'https://example.com/documents/reclamacion_deuda.pdf', fileSize: 456789, mimeType: 'application/pdf', uploadedBy: lawyer1.id, description: 'Demanda de reclamación de deuda' },
    { id: 'doc-005', expedienteId: 'exp-005', filename: 'acuerdo_pago.pdf', originalName: 'acuerdo_pago.pdf', fileUrl: 'https://example.com/documents/acuerdo_pago.pdf', fileSize: 567890, mimeType: 'application/pdf', uploadedBy: lawyer1.id, description: 'Acuerdo de pago firmado' },
  ];
  for (const doc of documentos) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: { ...doc, uploadedAt: new Date() },
    });
  }

  // Crear citas (mínimo 5)
  const citas = [
    { id: 'app-001', clientId: clientProfile1.id, lawyerId: lawyer1.id, date: new Date('2024-02-15T10:00:00Z'), location: 'Oficina Principal - Sala de Reuniones', notes: 'Revisión del contrato de compraventa.' },
    { id: 'app-002', clientId: clientProfile2.id, lawyerId: lawyer2.id, date: new Date('2024-02-16T14:00:00Z'), location: 'Oficina Principal - Sala de Reuniones', notes: 'Seguimiento de la demanda laboral.' },
    { id: 'app-003', clientId: clientProfile1.id, lawyerId: lawyer1.id, date: new Date('2024-03-01T09:00:00Z'), location: 'Oficina Secundaria - Sala 2', notes: 'Primera reunión para reclamación de deuda.' },
    { id: 'app-004', clientId: clientProfile2.id, lawyerId: lawyer2.id, date: new Date('2024-03-02T11:00:00Z'), location: 'Oficina Principal - Sala de Juntas', notes: 'Revisión de documentación de herencia.' },
    { id: 'app-005', clientId: clientProfile1.id, lawyerId: lawyer1.id, date: new Date('2024-03-05T16:00:00Z'), location: 'Oficina Principal - Despacho 3', notes: 'Firma de acuerdo de pago.' },
  ];
  for (const cita of citas) {
    await prisma.appointment.upsert({ where: { id: cita.id }, update: {}, create: cita });
  }

  // Crear tareas (mínimo 5)
  const tareas = [
    { id: 'task-001', title: 'Revisar contrato de compraventa', description: 'Revisar y corregir el contrato de compraventa.', dueDate: new Date('2024-02-20T17:00:00Z'), priority: 'ALTA', status: 'PENDIENTE', expedienteId: 'exp-001', assignedTo: lawyer1.id, createdBy: lawyer1.id },
    { id: 'task-002', title: 'Preparar demanda laboral', description: 'Preparar la demanda laboral.', dueDate: new Date('2024-02-18T12:00:00Z'), priority: 'URGENTE', status: 'EN_PROGRESO', expedienteId: 'exp-002', assignedTo: lawyer2.id, createdBy: lawyer2.id },
    { id: 'task-003', title: 'Contactar cliente', description: 'Llamar al cliente para informar sobre el progreso.', dueDate: new Date('2024-02-15T16:00:00Z'), priority: 'MEDIA', status: 'COMPLETADA', expedienteId: 'exp-003', assignedTo: lawyer1.id, createdBy: lawyer1.id },
    { id: 'task-004', title: 'Revisar documentación de divorcio', description: 'Revisar toda la documentación presentada.', dueDate: new Date('2024-02-25T10:00:00Z'), priority: 'BAJA', status: 'PENDIENTE', expedienteId: 'exp-003', assignedTo: lawyer1.id, createdBy: lawyer1.id },
    { id: 'task-005', title: 'Preparar acuerdo de pago', description: 'Redactar y revisar el acuerdo de pago.', dueDate: new Date('2024-03-04T12:00:00Z'), priority: 'ALTA', status: 'PENDIENTE', expedienteId: 'exp-005', assignedTo: lawyer1.id, createdBy: lawyer1.id },
  ];
  for (const tarea of tareas) {
    await prisma.task.upsert({ where: { id: tarea.id }, update: {}, create: tarea });
  }

  console.log('✅ Extra seed completado: 5 expedientes, 5 documentos, 5 citas y 5 tareas asegurados.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el extra seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 