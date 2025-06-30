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
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { MenuConfigService } from './menu-config.service';
import { CreateMenuConfigDto, UpdateMenuConfigDto, MenuConfigResponseDto } from './dto/menu-config.dto';

@ApiTags('Menu Configuration')
@Controller('menu-config')
export class MenuConfigController {
  constructor(private readonly menuConfigService: MenuConfigService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear configuración de menú',
    description: 'Crea una nueva configuración de menú para un rol específico'
  })
  @ApiBody({ type: CreateMenuConfigDto })
  @ApiResponse({
    status: 201,
    description: 'Configuración de menú creada exitosamente',
    type: MenuConfigResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async create(@Body() createMenuConfigDto: CreateMenuConfigDto, @Request() req: any): Promise<MenuConfigResponseDto> {
    return this.menuConfigService.create(createMenuConfigDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener todas las configuraciones de menús',
    description: 'Retorna todas las configuraciones de menús del sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones de menús',
    type: [MenuConfigResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async findAll(): Promise<MenuConfigResponseDto[]> {
    return this.menuConfigService.findAll();
  }

  @Get('role/:role')
  @ApiOperation({
    summary: 'Obtener menú por rol (público)',
    description: 'Retorna la configuración de menú activa para un rol específico'
  })
  @ApiParam({ name: 'role', description: 'Rol del usuario', enum: Role })
  @ApiResponse({
    status: 200,
    description: 'Configuración de menú encontrada',
    type: MenuConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Menú no encontrado para el rol' })
  async findByRole(@Param('role') role: Role): Promise<MenuConfigResponseDto | null> {
    return this.menuConfigService.findByRole(role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener configuración de menú por ID',
    description: 'Retorna una configuración de menú específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de menú' })
  @ApiResponse({
    status: 200,
    description: 'Configuración de menú encontrada',
    type: MenuConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Configuración de menú no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async findOne(@Param('id') id: string): Promise<MenuConfigResponseDto> {
    return this.menuConfigService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar configuración de menú',
    description: 'Actualiza una configuración de menú existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de menú' })
  @ApiBody({ type: UpdateMenuConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración de menú actualizada exitosamente',
    type: MenuConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Configuración de menú no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async update(@Param('id') id: string, @Body() updateMenuConfigDto: UpdateMenuConfigDto): Promise<MenuConfigResponseDto> {
    return this.menuConfigService.update(id, updateMenuConfigDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar configuración de menú',
    description: 'Elimina una configuración de menú del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración de menú' })
  @ApiResponse({ status: 204, description: 'Configuración de menú eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Configuración de menú no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.menuConfigService.remove(id);
  }

  @Get('defaults/menus')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener menús por defecto',
    description: 'Retorna las configuraciones de menús por defecto para cada rol'
  })
  @ApiResponse({
    status: 200,
    description: 'Menús por defecto',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['ADMIN', 'ABOGADO', 'CLIENTE'] },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                url: { type: 'string' },
                icon: { type: 'string' },
                order: { type: 'number' },
                isVisible: { type: 'boolean' },
                isExternal: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async getDefaultMenus() {
    return this.menuConfigService.getDefaultMenus();
  }
} 