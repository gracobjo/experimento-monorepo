import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProvisionFondosService } from './provision-fondos.service';
import { CreateProvisionFondosDto } from './dto/create-provision-fondos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
// Si tienes el DTO, descomenta la siguiente línea:
// import { LinkToInvoiceDto } from './dto/link-to-invoice.dto';

@ApiTags('provision-fondos')
@Controller('provision-fondos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProvisionFondosController {
  constructor(private readonly service: ProvisionFondosService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener provisiones de fondos',
    description: 'Devuelve las provisiones de fondos con filtros opcionales'
  })
  @ApiQuery({ name: 'clientId', description: 'ID del cliente', required: false, type: String })
  @ApiQuery({ name: 'expedienteId', description: 'ID del expediente', required: false, type: String })
  @ApiQuery({ name: 'invoiceId', description: 'ID de la factura', required: false, type: String })
  @ApiQuery({ name: 'soloPendientes', description: 'Solo provisiones pendientes', required: false, type: Boolean })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de provisiones de fondos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          monto: { type: 'number' },
          descripcion: { type: 'string' },
          fechaProvision: { type: 'string', format: 'date' },
          estado: { type: 'string' },
          clientId: { type: 'string' },
          expedienteId: { type: 'string' },
          invoiceId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findAll(
    @Query('clientId') clientId?: string,
    @Query('expedienteId') expedienteId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('soloPendientes') soloPendientes?: string
  ) {
    return this.service.findAll({
      clientId,
      expedienteId,
      invoiceId,
      soloPendientes: soloPendientes === 'true',
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener provisión de fondos por ID',
    description: 'Devuelve una provisión de fondos específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la provisión', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Provisión de fondos encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        fechaProvision: { type: 'string', format: 'date' },
        estado: { type: 'string' },
        clientId: { type: 'string' },
        expedienteId: { type: 'string' },
        invoiceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        client: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        },
        expediente: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Provisión no encontrada' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Crear provisión de fondos',
    description: 'Crea una nueva provisión de fondos (ADMIN y ABOGADO)'
  })
  @ApiBody({ type: CreateProvisionFondosDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Provisión de fondos creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        fechaProvision: { type: 'string', format: 'date' },
        estado: { type: 'string' },
        clientId: { type: 'string' },
        expedienteId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  create(@Body() dto: CreateProvisionFondosDto) {
    return this.service.create(dto);
  }

  @Patch('link-to-invoice')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Vincular provisión a factura',
    description: 'Vincula una provisión de fondos a una factura (ADMIN y ABOGADO)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provisionId: { 
          type: 'string', 
          description: 'ID de la provisión de fondos',
          example: '123e4567-e89b-12d3-a456-426614174001'
        },
        invoiceId: { 
          type: 'string', 
          description: 'ID de la factura',
          example: '123e4567-e89b-12d3-a456-426614174002'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Provisión vinculada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        estado: { type: 'string', example: 'VINCULADA' },
        invoiceId: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Provisión o factura no encontrada' })
  linkToInvoice(@Body() dto: { provisionId: string; invoiceId: string }) {
    return this.service.linkToInvoice(dto.provisionId, dto.invoiceId);
  }
} 