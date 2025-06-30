import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeleassistanceSessionDto } from './dto/create-teleassistance-session.dto';
import { UpdateTeleassistanceSessionDto } from './dto/update-teleassistance-session.dto';
import { TeleassistanceSession } from '@prisma/client';

@Injectable()
export class TeleassistanceService {
  constructor(private prisma: PrismaService) {}

  async createSession(createDto: CreateTeleassistanceSessionDto): Promise<TeleassistanceSession> {
    const { userId, assistantId, issueType, description, remoteTool } = createDto;

    // Verificar que el usuario y asistente existen
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const assistant = await this.prisma.user.findUnique({ where: { id: assistantId } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!assistant) {
      throw new NotFoundException('Asistente no encontrado');
    }

    // Verificar que el asistente tiene rol de ADMIN o ABOGADO
    if (!['ADMIN', 'ABOGADO'].includes(assistant.role)) {
      throw new BadRequestException('El asistente debe tener rol de ADMIN o ABOGADO');
    }

    return this.prisma.teleassistanceSession.create({
      data: {
        userId,
        assistantId,
        issueType,
        description,
        remoteTool,
        status: 'PENDING',
        sessionCode: this.generateSessionCode(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getSessionById(id: string): Promise<TeleassistanceSession> {
    const session = await this.prisma.teleassistanceSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesión de teleasistencia no encontrada');
    }

    return session;
  }

  async getSessionsByUser(userId: string): Promise<TeleassistanceSession[]> {
    return this.prisma.teleassistanceSession.findMany({
      where: { userId },
      include: {
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSessionsByAssistant(assistantId: string): Promise<TeleassistanceSession[]> {
    return this.prisma.teleassistanceSession.findMany({
      where: { assistantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingSessions(): Promise<TeleassistanceSession[]> {
    return this.prisma.teleassistanceSession.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateSession(id: string, updateDto: UpdateTeleassistanceSessionDto): Promise<TeleassistanceSession> {
    const session = await this.prisma.teleassistanceSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Sesión de teleasistencia no encontrada');
    }

    return this.prisma.teleassistanceSession.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async startSession(id: string): Promise<TeleassistanceSession> {
    const session = await this.prisma.teleassistanceSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Sesión de teleasistencia no encontrada');
    }

    if (session.status !== 'PENDING') {
      throw new BadRequestException('La sesión no está pendiente');
    }

    return this.prisma.teleassistanceSession.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async endSession(id: string, resolution?: string): Promise<TeleassistanceSession> {
    const session = await this.prisma.teleassistanceSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Sesión de teleasistencia no encontrada');
    }

    if (session.status === 'COMPLETED') {
      throw new BadRequestException('La sesión ya está completada');
    }

    return this.prisma.teleassistanceSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        resolution,
        duration: session.startedAt 
          ? Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000 / 60) // duración en minutos
          : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async addMessage(sessionId: string, senderId: string, content: string, messageType: 'TEXT' | 'INSTRUCTION' | 'SYSTEM' = 'TEXT'): Promise<any> {
    const session = await this.prisma.teleassistanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de teleasistencia no encontrada');
    }

    return this.prisma.teleassistanceMessage.create({
      data: {
        sessionId,
        senderId,
        content,
        messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getSessionMessages(sessionId: string): Promise<any[]> {
    return this.prisma.teleassistanceMessage.findMany({
      where: { sessionId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRemoteTools(): Promise<any[]> {
    return [
      {
        id: 'remotely-anywhere',
        name: 'Remotely Anywhere',
        description: 'Herramienta de control remoto gratuita y fácil de usar',
        downloadUrl: 'https://remotely.one/',
        features: ['Control remoto completo', 'Chat integrado', 'Transferencia de archivos', 'Gratuito'],
        instructions: [
          'Descargar e instalar Remotely Anywhere',
          'Crear cuenta gratuita',
          'Compartir código de acceso con el asistente',
          'Permitir control remoto cuando se solicite'
        ]
      },
      {
        id: 'teamviewer-quicksupport',
        name: 'TeamViewer QuickSupport',
        description: 'Aplicación ligera para soporte remoto',
        downloadUrl: 'https://www.teamviewer.com/es/quick-support/',
        features: ['Aplicación ligera', 'Sin instalación', 'Conexión rápida', 'Gratuito para uso personal'],
        instructions: [
          'Descargar TeamViewer QuickSupport',
          'Ejecutar sin instalar',
          'Compartir ID y contraseña con el asistente',
          'Aceptar conexión remota'
        ]
      },
      {
        id: 'anydesk',
        name: 'AnyDesk',
        description: 'Software de escritorio remoto rápido y seguro',
        downloadUrl: 'https://anydesk.com/es',
        features: ['Conexión rápida', 'Alta seguridad', 'Interfaz simple', 'Versión gratuita disponible'],
        instructions: [
          'Descargar AnyDesk',
          'Instalar la aplicación',
          'Compartir código de AnyDesk con el asistente',
          'Aceptar solicitud de conexión'
        ]
      },
      {
        id: 'chrome-remote-desktop',
        name: 'Chrome Remote Desktop',
        description: 'Extensión de Chrome para acceso remoto',
        downloadUrl: 'https://remotedesktop.google.com/',
        features: ['Integrado con Chrome', 'Sin instalación adicional', 'Conexión segura', 'Completamente gratuito'],
        instructions: [
          'Instalar extensión Chrome Remote Desktop',
          'Configurar acceso remoto',
          'Compartir código de acceso con el asistente',
          'Autorizar conexión remota'
        ]
      }
    ];
  }

  async getCommonIssues(): Promise<any[]> {
    return [
      {
        id: 'autofirma',
        name: 'Problemas con Autofirma',
        description: 'Dificultades para instalar o usar Autofirma',
        category: 'ADMINISTRACION_ELECTRONICA',
        commonProblems: [
          'No se instala correctamente',
          'No reconoce el certificado digital',
          'Error al firmar documentos',
          'Problemas de compatibilidad con el navegador'
        ],
        solutions: [
          'Verificar requisitos del sistema',
          'Instalar certificados raíz',
          'Configurar navegador correctamente',
          'Actualizar Java si es necesario'
        ]
      },
      {
        id: 'certificado-digital',
        name: 'Certificado Digital',
        description: 'Problemas con certificados digitales',
        category: 'ADMINISTRACION_ELECTRONICA',
        commonProblems: [
          'Certificado expirado',
          'No se reconoce en el navegador',
          'Error de instalación',
          'Problemas de compatibilidad'
        ],
        solutions: [
          'Renovar certificado si está expirado',
          'Instalar certificados raíz',
          'Configurar navegador',
          'Verificar compatibilidad del sistema'
        ]
      },
      {
        id: 'sedes',
        name: 'SEDES (Sede Electrónica)',
        description: 'Problemas con sedes electrónicas',
        category: 'ADMINISTRACION_ELECTRONICA',
        commonProblems: [
          'No se puede acceder',
          'Error al enviar documentos',
          'Problemas de autenticación',
          'Documentos no se cargan'
        ],
        solutions: [
          'Verificar credenciales de acceso',
          'Comprobar requisitos técnicos',
          'Usar navegador compatible',
          'Contactar soporte técnico'
        ]
      },
      {
        id: 'clave-pin',
        name: 'Cl@ve PIN',
        description: 'Problemas con sistema Cl@ve',
        category: 'ADMINISTRACION_ELECTRONICA',
        commonProblems: [
          'No se recibe SMS',
          'Error de autenticación',
          'Problemas de registro',
          'PIN no válido'
        ],
        solutions: [
          'Verificar número de teléfono',
          'Comprobar cobertura móvil',
          'Registrar nuevo dispositivo',
          'Solicitar nuevo PIN'
        ]
      },
      {
        id: 'navegador',
        name: 'Problemas de Navegador',
        description: 'Configuración y compatibilidad de navegadores',
        category: 'TECNICO',
        commonProblems: [
          'Páginas no cargan correctamente',
          'Certificados no se reconocen',
          'JavaScript deshabilitado',
          'Cookies bloqueadas'
        ],
        solutions: [
          'Actualizar navegador',
          'Habilitar JavaScript',
          'Configurar cookies',
          'Instalar certificados necesarios'
        ]
      },
      {
        id: 'sistema-operativo',
        name: 'Sistema Operativo',
        description: 'Problemas de compatibilidad del SO',
        category: 'TECNICO',
        commonProblems: [
          'Software no compatible',
          'Permisos insuficientes',
          'Actualizaciones pendientes',
          'Antivirus bloquea aplicaciones'
        ],
        solutions: [
          'Actualizar sistema operativo',
          'Ejecutar como administrador',
          'Configurar antivirus',
          'Verificar requisitos mínimos'
        ]
      }
    ];
  }

  private generateSessionCode(): string {
    // Generar código de 6 dígitos alfanumérico
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getSessionStats(): Promise<any> {
    const totalSessions = await this.prisma.teleassistanceSession.count();
    const pendingSessions = await this.prisma.teleassistanceSession.count({
      where: { status: 'PENDING' },
    });
    const activeSessions = await this.prisma.teleassistanceSession.count({
      where: { status: 'ACTIVE' },
    });
    const completedSessions = await this.prisma.teleassistanceSession.count({
      where: { status: 'COMPLETED' },
    });

    const averageDuration = await this.prisma.teleassistanceSession.aggregate({
      where: { 
        status: 'COMPLETED',
        duration: { not: null }
      },
      _avg: { duration: true },
    });

    return {
      totalSessions,
      pendingSessions,
      activeSessions,
      completedSessions,
      averageDuration: averageDuration._avg.duration || 0,
    };
  }

  async getAvailableAssistants(): Promise<any[]> {
    // Obtener usuarios con rol ADMIN o ABOGADO que pueden ser asistentes
    const assistants = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'ABOGADO']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: {
          select: {
            phone: true,
            specialization: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return assistants.map(assistant => ({
      id: assistant.id,
      name: assistant.name,
      email: assistant.email,
      role: assistant.role,
      phone: assistant.profile?.phone,
      specialization: assistant.profile?.specialization,
      isAvailable: true // Por defecto todos están disponibles
    }));
  }
} 