import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Subir documento',
    description: 'Sube un documento al sistema (PDF, TXT, CSV, DOC, DOCX, JPG, JPEG, PNG, GIF, WEBP - máximo 5MB)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (máximo 5MB)'
        },
        title: {
          type: 'string',
          description: 'Título del documento'
        },
        description: {
          type: 'string',
          description: 'Descripción del documento'
        },
        caseId: {
          type: 'string',
          description: 'ID del expediente asociado (opcional)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Documento subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'number' },
        uploadedBy: { type: 'string' },
        caseId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 413, description: 'Archivo demasiado grande' })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(pdf|txt|csv|doc|docx|jpg|jpeg|png|gif|webp)' }),
        ],
      }),
    )
    file: any,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.uploadDocument(
      file,
      uploadDocumentDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los documentos',
    description: 'Devuelve todos los documentos accesibles para el usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de documentos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          uploadedBy: { type: 'string' },
          caseId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Request() req) {
    return this.documentsService.findAll(req.user.id, req.user.role);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estadísticas de documentos',
    description: 'Devuelve estadísticas de documentos para el usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de documentos',
    schema: {
      type: 'object',
      properties: {
        totalDocuments: { type: 'number' },
        totalSize: { type: 'number' },
        documentsByType: {
          type: 'object',
          properties: {
            pdf: { type: 'number' },
            doc: { type: 'number' },
            image: { type: 'number' },
            other: { type: 'number' }
          }
        },
        recentUploads: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getStats(@Request() req) {
    return this.documentsService.getDocumentsStats(req.user.id, req.user.role);
  }

  @Get('expediente/:expedienteId')
  @ApiOperation({ 
    summary: 'Obtener documentos por expediente',
    description: 'Devuelve todos los documentos asociados a un expediente específico'
  })
  @ApiParam({ name: 'expedienteId', description: 'ID del expediente', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documentos del expediente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          uploadedBy: { type: 'string' },
          caseId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  findByExpediente(
    @Param('expedienteId') expedienteId: string,
    @Request() req,
  ) {
    return this.documentsService.findByExpediente(
      expedienteId,
      req.user.id,
      req.user.role,
    );
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener documento por ID',
    description: 'Devuelve un documento específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'number' },
        uploadedBy: { type: 'string' },
        caseId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.id, req.user.role);
  }

  @Get(':id/download')
  @ApiOperation({ 
    summary: 'Descargar documento',
    description: 'Descarga un documento específico'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo descargado',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async downloadDocument(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(
      id,
      req.user.id,
      req.user.role,
    );

    const fileStream = this.documentsService.getFileStream(document.filename);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalName}"`,
    );

    fileStream.pipe(res);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Eliminar documento',
    description: 'Elimina un documento del sistema (solo ADMIN y ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documento eliminado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.remove(id, req.user.id, req.user.role);
  }
} 