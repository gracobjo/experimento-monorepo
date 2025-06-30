import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe, Request, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(Role.ABOGADO)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Crear factura',
    description: 'Crea una nueva factura electrónica (solo ABOGADO)'
  })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Factura creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        numero: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        emisorId: { type: 'string' },
        receptorId: { type: 'string' },
        importeTotal: { type: 'number' },
        estado: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    // Forzar que el emisorId sea el del usuario autenticado
    createInvoiceDto.emisorId = req.user.id;
    try {
      return await this.invoicesService.create(createInvoiceDto);
    } catch (error: any) {
      console.error('Invoice creation error:', error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error creating invoice',
        details: error?.response?.data || error?.message || String(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Obtener todas las facturas',
    description: 'Devuelve todas las facturas (ADMIN y ABOGADO)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de facturas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          numero: { type: 'string' },
          fecha: { type: 'string', format: 'date' },
          emisorId: { type: 'string' },
          receptorId: { type: 'string' },
          importeTotal: { type: 'number' },
          estado: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Obtener factura por ID',
    description: 'Devuelve una factura específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        numero: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        emisorId: { type: 'string' },
        receptorId: { type: 'string' },
        importeTotal: { type: 'number' },
        estado: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ABOGADO)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Actualizar factura',
    description: 'Actualiza una factura existente (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        numero: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        emisorId: { type: 'string' },
        receptorId: { type: 'string' },
        importeTotal: { type: 'number' },
        estado: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @Roles(Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Eliminar factura',
    description: 'Elimina una factura del sistema (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Factura eliminada exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post(':id/sign')
  @Roles(Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Firmar factura',
    description: 'Firma digitalmente una factura (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        certPath: { type: 'string', description: 'Ruta al certificado (opcional)' },
        keyPath: { type: 'string', description: 'Ruta a la clave privada (opcional)' },
        certContent: { type: 'string', description: 'Contenido del certificado (opcional)' },
        keyContent: { type: 'string', description: 'Contenido de la clave privada (opcional)' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura firmada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        signedXml: { type: 'string' },
        signatureValid: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async sign(@Param('id') id: string, @Body() body: { certPath?: string; keyPath?: string; certContent?: string; keyContent?: string }) {
    // Si se recibe el contenido, usarlo; si no, usar rutas o variables de entorno
    const certContent = body.certContent;
    const keyContent = body.keyContent;
    const certPath = body.certPath || process.env.FACTURAE_CERT_PATH;
    const keyPath = body.keyPath || process.env.FACTURAE_KEY_PATH;
    return this.invoicesService.sign(id, certPath, keyPath, certContent, keyContent);
  }

  @Post('generate-xml')
  @Roles(Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Generar XML de facturas',
    description: 'Genera XML para múltiples facturas (solo ABOGADO)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array de IDs de facturas'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'XML generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        xml: { type: 'string' },
        facturas: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async generateXml(@Body() body: { ids: string[] }, @Request() req) {
    // Validar que el usuario es el emisor de cada factura
    return this.invoicesService.generateXmlForInvoices(body.ids, req.user.id);
  }

  @Post('upload-signed')
  @Roles(Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Subir factura firmada',
    description: 'Sube una factura ya firmada (solo ABOGADO)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID de la factura' },
        signedXml: { type: 'string', description: 'XML firmado de la factura' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura firmada guardada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        signedXml: { type: 'string' },
        signatureValid: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async uploadSigned(@Body() body: { id: string; signedXml: string }, @Request() req) {
    // Validar que el usuario es el emisor de la factura
    return this.invoicesService.saveSignedXml(body.id, body.signedXml, req.user.id);
  }

  @Patch(':id/anular')
  @Roles(Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Anular factura',
    description: 'Anula una factura con motivo (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivoAnulacion: { 
          type: 'string', 
          description: 'Motivo de la anulación (mínimo 3 caracteres)',
          minLength: 3
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura anulada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        estado: { type: 'string', example: 'ANULADA' },
        motivoAnulacion: { type: 'string' },
        fechaAnulacion: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Motivo de anulación inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async annul(@Param('id') id: string, @Body() body: { motivoAnulacion: string }, @Request() req) {
    if (!body.motivoAnulacion || body.motivoAnulacion.trim().length < 3) {
      throw new HttpException('El motivo de anulación es obligatorio y debe tener al menos 3 caracteres.', HttpStatus.BAD_REQUEST);
    }
    return this.invoicesService.annul(id, body.motivoAnulacion, req.user.id);
  }
} 