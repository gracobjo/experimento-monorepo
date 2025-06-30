import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeSiteConfigs() {
  console.log('🔧 Inicializando configuraciones del sitio...');

  const defaultConfigs = [
    // Configuraciones de marca
    {
      key: 'site_name',
      value: 'Despacho Legal',
      type: 'string',
      category: 'branding',
      description: 'Nombre del sitio web',
      isPublic: true
    },
    {
      key: 'site_description',
      value: 'Servicios legales profesionales y confiables',
      type: 'string',
      category: 'branding',
      description: 'Descripción del sitio web',
      isPublic: true
    },
    {
      key: 'logo_url',
      value: '/images/logo.png',
      type: 'image',
      category: 'branding',
      description: 'URL del logo de la empresa',
      isPublic: true
    },
    {
      key: 'favicon_url',
      value: '/images/favicon.ico',
      type: 'image',
      category: 'branding',
      description: 'URL del favicon',
      isPublic: true
    },
    {
      key: 'primary_color',
      value: '#1e40af',
      type: 'color',
      category: 'branding',
      description: 'Color primario del sitio',
      isPublic: true
    },
    {
      key: 'secondary_color',
      value: '#3b82f6',
      type: 'color',
      category: 'branding',
      description: 'Color secundario del sitio',
      isPublic: true
    },

    // Configuraciones de layout
    {
      key: 'sidebar_position',
      value: 'left',
      type: 'string',
      category: 'layout',
      description: 'Posición del sidebar (left, right)',
      isPublic: false
    },
    {
      key: 'sidebar_width',
      value: '250px',
      type: 'string',
      category: 'layout',
      description: 'Ancho del sidebar',
      isPublic: false
    },
    {
      key: 'header_fixed',
      value: 'true',
      type: 'boolean',
      category: 'layout',
      description: 'Si el header debe estar fijo',
      isPublic: false
    },
    {
      key: 'footer_visible',
      value: 'true',
      type: 'boolean',
      category: 'layout',
      description: 'Si el footer debe ser visible',
      isPublic: false
    },

    // Configuraciones de contacto
    {
      key: 'contact_email',
      value: 'info@despacholegal.com',
      type: 'email',
      category: 'contact',
      description: 'Email de contacto principal',
      isPublic: true
    },
    {
      key: 'contact_phone',
      value: '+34 123 456 789',
      type: 'string',
      category: 'contact',
      description: 'Teléfono de contacto',
      isPublic: true
    },
    {
      key: 'contact_address',
      value: 'Calle Principal 123, Madrid',
      type: 'string',
      category: 'contact',
      description: 'Dirección de contacto',
      isPublic: true
    },
    {
      key: 'office_hours',
      value: 'Lunes a Viernes: 9:00 - 18:00',
      type: 'string',
      category: 'contact',
      description: 'Horario de oficina',
      isPublic: true
    },

    // Configuraciones sociales
    {
      key: 'social_facebook',
      value: 'https://facebook.com/despacholegal',
      type: 'string',
      category: 'social',
      description: 'URL de Facebook',
      isPublic: true
    },
    {
      key: 'social_twitter',
      value: 'https://twitter.com/despacholegal',
      type: 'string',
      category: 'social',
      description: 'URL de Twitter',
      isPublic: true
    },
    {
      key: 'social_linkedin',
      value: 'https://linkedin.com/company/despacholegal',
      type: 'string',
      category: 'social',
      description: 'URL de LinkedIn',
      isPublic: true
    },
    {
      key: 'social_instagram',
      value: 'https://instagram.com/despacholegal',
      type: 'string',
      category: 'social',
      description: 'URL de Instagram',
      isPublic: true
    },

    // Configuraciones generales
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'general',
      description: 'Modo mantenimiento',
      isPublic: false
    },
    {
      key: 'default_language',
      value: 'es',
      type: 'string',
      category: 'general',
      description: 'Idioma por defecto',
      isPublic: true
    },
    {
      key: 'timezone',
      value: 'Europe/Madrid',
      type: 'string',
      category: 'general',
      description: 'Zona horaria del sitio',
      isPublic: false
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      type: 'string',
      category: 'general',
      description: 'Formato de fecha',
      isPublic: false
    }
  ];

  for (const config of defaultConfigs) {
    const existingConfig = await prisma.siteConfig.findUnique({
      where: { key: config.key }
    });

    if (!existingConfig) {
      await prisma.siteConfig.create({
        data: config
      });
      console.log(`✅ Configuración creada: ${config.key}`);
    } else {
      console.log(`⏭️  Configuración ya existe: ${config.key}`);
    }
  }

  console.log('✅ Configuraciones del sitio inicializadas');
}

async function initializeMenuConfigs() {
  console.log('🍽️  Inicializando configuraciones de menús...');

  // Obtener un usuario admin para crear los menús
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.log('⚠️  No se encontró usuario admin, saltando inicialización de menús');
    return;
  }

  const defaultMenus = [
    {
      name: 'Menú Principal - Admin',
      role: Role.ADMIN,
      orientation: 'horizontal',
      isActive: true,
      items: [
        { label: 'Dashboard', url: '/admin/dashboard', icon: '🏠', order: 0, isVisible: true, isExternal: false },
        { label: 'Usuarios', url: '/admin/users', icon: '👥', order: 1, isVisible: true, isExternal: false },
        { label: 'Expedientes', url: '/admin/cases', icon: '📋', order: 2, isVisible: true, isExternal: false },
        { label: 'Citas', url: '/admin/appointments', icon: '📅', order: 3, isVisible: true, isExternal: false },
        { label: 'Tareas', url: '/admin/tasks', icon: '✅', order: 4, isVisible: true, isExternal: false },
        { label: 'Documentos', url: '/admin/documents', icon: '📄', order: 5, isVisible: true, isExternal: false },
        { label: 'Reportes', url: '/admin/reports', icon: '📊', order: 6, isVisible: true, isExternal: false },
        { label: 'Configuración', url: '/admin/parametros', icon: '⚙️', order: 7, isVisible: true, isExternal: false }
      ]
    },
    {
      name: 'Menú Principal - Abogado',
      role: Role.ABOGADO,
      orientation: 'horizontal',
      isActive: true,
      items: [
        { label: 'Dashboard', url: '/dashboard', icon: '🏠', order: 0, isVisible: true, isExternal: false },
        { label: 'Mis Expedientes', url: '/lawyer/cases', icon: '📋', order: 1, isVisible: true, isExternal: false },
        { label: 'Citas', url: '/lawyer/appointments', icon: '📅', order: 2, isVisible: true, isExternal: false },
        { label: 'Tareas', url: '/lawyer/tasks', icon: '✅', order: 3, isVisible: true, isExternal: false },
        { label: 'Chat', url: '/lawyer/chat', icon: '💬', order: 4, isVisible: true, isExternal: false },
        { label: 'Reportes', url: '/lawyer/reports', icon: '📊', order: 5, isVisible: true, isExternal: false },
        { label: 'Facturación', url: '#', icon: '🧾', order: 6, isVisible: true, isExternal: false }
      ]
    },
    {
      name: 'Menú Principal - Cliente',
      role: Role.CLIENTE,
      orientation: 'horizontal',
      isActive: true,
      items: [
        { label: 'Dashboard', url: '/dashboard', icon: '🏠', order: 0, isVisible: true, isExternal: false },
        { label: 'Mis Expedientes', url: '/client/cases', icon: '📋', order: 1, isVisible: true, isExternal: false },
        { label: 'Provisiones', url: '/client/provisiones', icon: '💰', order: 2, isVisible: true, isExternal: false },
        { label: 'Mis Citas', url: '/client/appointments', icon: '📅', order: 3, isVisible: true, isExternal: false },
        { label: 'Chat', url: '/client/chat', icon: '💬', order: 4, isVisible: true, isExternal: false }
      ]
    }
  ];

  for (const menuData of defaultMenus) {
    const existingMenu = await prisma.menuConfig.findFirst({
      where: {
        role: menuData.role,
        isActive: true
      }
    });

    if (!existingMenu) {
      const menuConfig = await prisma.menuConfig.create({
        data: {
          name: menuData.name,
          role: menuData.role,
          orientation: menuData.orientation,
          isActive: menuData.isActive,
          items: {
            create: menuData.items.map((item, index) => ({
              label: item.label,
              url: item.url,
              icon: item.icon,
              order: item.order || index,
              isVisible: item.isVisible,
              isExternal: item.isExternal
            }))
          }
        }
      });

      console.log(`✅ Menú creado: ${menuData.name}`);
    } else {
      console.log(`⏭️  Menú ya existe para rol ${menuData.role}`);
    }
  }

  console.log('✅ Configuraciones de menús inicializadas');
}

async function main() {
  try {
    console.log('🚀 Iniciando inicialización de configuraciones...');
    
    await initializeSiteConfigs();
    await initializeMenuConfigs();
    
    console.log('🎉 Inicialización completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 