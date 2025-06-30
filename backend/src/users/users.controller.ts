import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Crear nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema (solo ADMIN y ABOGADO)'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'ABOGADO', 'CLIENTE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios',
    description: 'Devuelve la lista de todos los usuarios (solo ADMIN)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'ABOGADO', 'CLIENTE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('clients')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Obtener todos los clientes',
    description: 'Devuelve la lista de todos los clientes (ADMIN y ABOGADO)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de clientes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['CLIENTE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findClients() {
    return this.usersService.findClients();
  }

  @Get('clients/my')
  @Roles(Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Obtener mis clientes',
    description: 'Devuelve los clientes asignados al abogado autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de clientes del abogado',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['CLIENTE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findMyClients(@Request() req) {
    return this.usersService.findClientsByLawyer(req.user.id);
  }

  @Get('clients/stats')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Estadísticas de clientes',
    description: 'Devuelve estadísticas de clientes (ADMIN ve todos, ABOGADO ve solo los suyos)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de clientes',
    schema: {
      type: 'object',
      properties: {
        totalClients: { type: 'number' },
        activeClients: { type: 'number' },
        newClientsThisMonth: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  getClientStats(@Request() req) {
    const lawyerId = req.user.role === 'ABOGADO' ? req.user.id : undefined;
    return this.usersService.getClientStats(lawyerId);
  }

  @Get('clients/report')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Reporte de clientes',
    description: 'Devuelve un reporte detallado de clientes (ADMIN ve todos, ABOGADO ve solo los suyos)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de clientes',
    schema: {
      type: 'object',
      properties: {
        clients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              casesCount: { type: 'number' },
              lastActivity: { type: 'string', format: 'date-time' }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalClients: { type: 'number' },
            activeClients: { type: 'number' },
            averageCasesPerClient: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  getClientReport(@Request() req) {
    const lawyerId = req.user.role === 'ABOGADO' ? req.user.id : undefined;
    return this.usersService.getClientReport(lawyerId);
  }

  @Get('clients/profile')
  @Roles(Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener mi perfil de cliente',
    description: 'Devuelve el perfil del cliente autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del cliente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string', enum: ['CLIENTE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        cases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  getMyClientProfile(@Request() req) {
    return this.usersService.getMyClientProfile(req.user.id);
  }

  @Get('lawyers')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener todos los abogados',
    description: 'Devuelve la lista de todos los abogados (todos los roles)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de abogados',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ABOGADO'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findLawyers() {
    return this.usersService.findLawyers();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Devuelve un usuario específico por su ID (solo ADMIN)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'ABOGADO', 'CLIENTE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario (solo ADMIN)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'ABOGADO', 'CLIENTE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema (solo ADMIN)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario eliminado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 