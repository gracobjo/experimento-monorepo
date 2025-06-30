import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // Configuración de archivos permitidos
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_FILES_PER_CASE = 5;
  private readonly UPLOAD_DIR = 'uploads';

  async uploadDocument(
    file: any,
    uploadDocumentDto: UploadDocumentDto,
    currentUserId: string,
    userRole: string
  ) {
    // Validar expediente
    const expediente = await this.prisma.expediente.findUnique({
      where: { id: uploadDocumentDto.expedienteId },
      include: {
        client: true,
        lawyer: true,
        documents: true,
      }
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client || expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para subir documentos a este expediente');
      }
    } else if (userRole === 'ABOGADO') {
      if (expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para subir documentos a este expediente');
      }
    }
    // Los admins pueden subir documentos a cualquier expediente

    // Validar límite de archivos
    if (expediente.documents.length >= this.MAX_FILES_PER_CASE) {
      throw new BadRequestException(`No se pueden subir más de ${this.MAX_FILES_PER_CASE} archivos por expediente`);
    }

    // Validar archivo
    this.validateFile(file);

    // Crear directorio de uploads si no existe
    const uploadPath = path.join(process.cwd(), this.UPLOAD_DIR);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadPath, uniqueFilename);

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    // Guardar información en base de datos
    const document = await this.prisma.document.create({
      data: {
        filename: uniqueFilename,
        originalName: file.originalname,
        fileUrl: `/uploads/${uniqueFilename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        description: uploadDocumentDto.description,
        expedienteId: uploadDocumentDto.expedienteId,
        uploadedBy: currentUserId,
      },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      }
    });

    return document;
  }

  async findAll(currentUserId: string, userRole: string) {
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
      
      whereClause = {
        expediente: {
          clientId: client.id
        }
      };
    } else if (userRole === 'ABOGADO') {
      whereClause = {
        expediente: {
          lawyerId: currentUserId
        }
      };
    }
    // Los admins ven todos los documentos

    return this.prisma.document.findMany({
      where: whereClause,
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: {
        uploadedAt: 'desc'
      },
    });
  }

  async findByExpediente(expedienteId: string, currentUserId: string, userRole: string) {
    // Verificar que el expediente existe y el usuario tiene permisos
    const expediente = await this.prisma.expediente.findUnique({
      where: { id: expedienteId },
      include: {
        client: true,
        lawyer: true,
      }
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client || expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver documentos de este expediente');
      }
    } else if (userRole === 'ABOGADO') {
      if (expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver documentos de este expediente');
      }
    }
    // Los admins pueden ver cualquier documento

    return this.prisma.document.findMany({
      where: { expedienteId },
      orderBy: {
        uploadedAt: 'desc'
      },
    });
  }

  async findOne(id: string, currentUserId: string, userRole: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        },
      }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client || document.expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    } else if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    }
    // Los admins pueden ver cualquier documento

    return document;
  }

  async remove(id: string, currentUserId: string, userRole: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            lawyer: true,
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar permisos
    if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('Solo puedes eliminar documentos de expedientes asignados a ti');
      }
    } else if (userRole === 'CLIENTE') {
      throw new ForbiddenException('Los clientes no pueden eliminar documentos');
    }
    // Los admins pueden eliminar cualquier documento

    // Eliminar archivo físico
    const filePath = path.join(process.cwd(), this.UPLOAD_DIR, document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar registro de la base de datos
    await this.prisma.document.delete({
      where: { id }
    });

    return { message: 'Documento eliminado exitosamente' };
  }

  async getDocumentsStats(currentUserId: string, userRole: string) {
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
      
      whereClause = {
        expediente: {
          clientId: client.id
        }
      };
    } else if (userRole === 'ABOGADO') {
      whereClause = {
        expediente: {
          lawyerId: currentUserId
        }
      };
    }
    // Los admins ven estadísticas de todos los documentos

    const [total, totalSize, byType] = await Promise.all([
      this.prisma.document.count({ where: whereClause }),
      this.prisma.document.aggregate({
        where: whereClause,
        _sum: {
          fileSize: true
        }
      }),
      this.prisma.document.groupBy({
        by: ['mimeType'],
        where: whereClause,
        _count: {
          id: true
        }
      })
    ]);

    return {
      total,
      totalSize: totalSize._sum.fileSize || 0,
      byType: byType.map(type => ({
        type: type.mimeType,
        count: type._count.id
      }))
    };
  }

  private validateFile(file: any) {
    // Validar tipo de archivo
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: PDF, TXT, DOC, DOCX, JPG, PNG, GIF, WEBP`
      );
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo de ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      throw new BadRequestException('El archivo no puede estar vacío');
    }
  }

  getFileStream(filename: string) {
    const filePath = path.join(process.cwd(), this.UPLOAD_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return fs.createReadStream(filePath);
  }
} 