import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ParametrosService } from './parametros.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('parametros')
@Controller('parametros')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todos los parámetros',
    description: 'Devuelve la lista de todos los parámetros del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de parámetros',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clave: { type: 'string' },
          valor: { type: 'string' },
          etiqueta: { type: 'string' },
          tipo: { type: 'string' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  findAll() {
    return this.parametrosService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener parámetro por ID',
    description: 'Devuelve un parámetro específico del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del parámetro', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Parámetro encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  findOne(@Param('id') id: string) {
    return this.parametrosService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nuevo parámetro',
    description: 'Crea un nuevo parámetro de configuración del sistema'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        clave: { 
          type: 'string', 
          description: 'Clave única del parámetro',
          example: 'EMAIL_SMTP_HOST'
        },
        valor: { 
          type: 'string', 
          description: 'Valor del parámetro',
          example: 'smtp.gmail.com'
        },
        etiqueta: { 
          type: 'string', 
          description: 'Etiqueta descriptiva',
          example: 'Servidor SMTP'
        },
        tipo: { 
          type: 'string', 
          description: 'Tipo de dato',
          example: 'string',
          enum: ['string', 'number', 'email', 'image', 'boolean']
        }
      },
      required: ['clave', 'valor', 'etiqueta', 'tipo']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Parámetro creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Clave ya existe' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  create(@Body() data: { clave: string; valor: string; etiqueta: string; tipo: string }) {
    return this.parametrosService.create(data);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar parámetro',
    description: 'Actualiza un parámetro existente del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del parámetro', type: 'string' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        valor: { 
          type: 'string', 
          description: 'Nuevo valor del parámetro',
          example: 'smtp.outlook.com'
        },
        etiqueta: { 
          type: 'string', 
          description: 'Nueva etiqueta descriptiva',
          example: 'Servidor SMTP (Actualizado)'
        },
        tipo: { 
          type: 'string', 
          description: 'Nuevo tipo de dato',
          example: 'string',
          enum: ['string', 'number', 'email', 'image', 'boolean']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Parámetro actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  update(@Param('id') id: string, @Body() data: { valor?: string; etiqueta?: string; tipo?: string }) {
    return this.parametrosService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar parámetro',
    description: 'Elimina un parámetro del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del parámetro', type: 'string' })
  @ApiResponse({ status: 200, description: 'Parámetro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  remove(@Param('id') id: string) {
    return this.parametrosService.remove(id);
  }
} 