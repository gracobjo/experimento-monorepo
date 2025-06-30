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
import { LayoutsService } from './layouts.service';
import { CreateLayoutDto, UpdateLayoutDto, LayoutConfigDto } from './dto/layout.dto';

@ApiTags('Layouts - Home Builder')
@Controller('layouts')
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  @Get('home')
  @ApiOperation({
    summary: 'Obtener layout activo de la home (público)',
    description: 'Retorna el layout activo para la página principal'
  })
  @ApiResponse({
    status: 200,
    description: 'Layout activo encontrado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'No hay layout activo para la home'
  })
  async getActiveHomeLayout(): Promise<LayoutConfigDto | null> {
    return this.layoutsService.findActiveLayout('home');
  }
}

@ApiTags('Admin - Layouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/layouts')
export class AdminLayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear un nuevo layout',
    description: 'Crea un nuevo layout para el Home Builder'
  })
  @ApiBody({ type: CreateLayoutDto })
  @ApiResponse({
    status: 201,
    description: 'Layout creado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un layout con este nombre'
  })
  async create(
    @Body() createLayoutDto: CreateLayoutDto,
    @Request() req: any
  ): Promise<LayoutConfigDto> {
    return this.layoutsService.create(createLayoutDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener todos los layouts',
    description: 'Retorna una lista de todos los layouts disponibles'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de layouts obtenida exitosamente',
    type: [LayoutConfigDto]
  })
  async findAll(): Promise<LayoutConfigDto[]> {
    return this.layoutsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener un layout por ID',
    description: 'Retorna un layout específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del layout' })
  @ApiResponse({
    status: 200,
    description: 'Layout encontrado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  async findOne(@Param('id') id: string): Promise<LayoutConfigDto> {
    return this.layoutsService.findOne(id);
  }

  @Get('slug/:slug')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener un layout por slug',
    description: 'Retorna un layout específico por su slug'
  })
  @ApiParam({ name: 'slug', description: 'Slug del layout (ej: home, about)' })
  @ApiResponse({
    status: 200,
    description: 'Layout encontrado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  async findBySlug(@Param('slug') slug: string): Promise<LayoutConfigDto> {
    return this.layoutsService.findBySlug(slug);
  }

  @Get('active/:slug')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener layout activo por slug',
    description: 'Retorna el layout activo para un slug específico'
  })
  @ApiParam({ name: 'slug', description: 'Slug del layout (ej: home, about)' })
  @ApiResponse({
    status: 200,
    description: 'Layout activo encontrado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'No hay layout activo para este slug'
  })
  async findActiveLayout(@Param('slug') slug: string): Promise<LayoutConfigDto | null> {
    return this.layoutsService.findActiveLayout(slug);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Actualizar un layout',
    description: 'Actualiza un layout existente'
  })
  @ApiParam({ name: 'id', description: 'ID del layout' })
  @ApiBody({ type: UpdateLayoutDto })
  @ApiResponse({
    status: 200,
    description: 'Layout actualizado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un layout con este nombre'
  })
  async update(
    @Param('id') id: string,
    @Body() updateLayoutDto: UpdateLayoutDto,
    @Request() req: any
  ): Promise<LayoutConfigDto> {
    return this.layoutsService.update(id, updateLayoutDto, req.user.id);
  }

  @Post(':id/activate')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar un layout',
    description: 'Activa un layout y desactiva otros con el mismo slug'
  })
  @ApiParam({ name: 'id', description: 'ID del layout a activar' })
  @ApiResponse({
    status: 200,
    description: 'Layout activado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  async activate(@Param('id') id: string): Promise<LayoutConfigDto> {
    return this.layoutsService.activate(id);
  }

  @Post(':id/deactivate')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un layout',
    description: 'Desactiva un layout específico'
  })
  @ApiParam({ name: 'id', description: 'ID del layout a desactivar' })
  @ApiResponse({
    status: 200,
    description: 'Layout desactivado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  async deactivate(@Param('id') id: string): Promise<LayoutConfigDto> {
    return this.layoutsService.deactivate(id);
  }

  @Post(':id/duplicate')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Duplicar un layout',
    description: 'Crea una copia de un layout existente'
  })
  @ApiParam({ name: 'id', description: 'ID del layout a duplicar' })
  @ApiResponse({
    status: 201,
    description: 'Layout duplicado exitosamente',
    type: LayoutConfigDto
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  async duplicate(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<LayoutConfigDto> {
    return this.layoutsService.duplicate(id, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un layout',
    description: 'Elimina un layout específico'
  })
  @ApiParam({ name: 'id', description: 'ID del layout a eliminar' })
  @ApiResponse({
    status: 204,
    description: 'Layout eliminado exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Layout no encontrado'
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.layoutsService.remove(id);
  }
} 