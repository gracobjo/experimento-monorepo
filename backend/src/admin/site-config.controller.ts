import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { SiteConfigService } from './site-config.service';
import { CreateSiteConfigDto, UpdateSiteConfigDto, SiteConfigResponseDto, SiteConfigCategoryDto } from './dto/site-config.dto';

@ApiTags('Site Configuration')
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear configuración del sitio',
    description: 'Crea una nueva configuración del sitio'
  })
  @ApiBody({ type: CreateSiteConfigDto })
  @ApiResponse({
    status: 201,
    description: 'Configuración del sitio creada exitosamente',
    type: SiteConfigResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async create(@Body() createSiteConfigDto: CreateSiteConfigDto): Promise<SiteConfigResponseDto> {
    return this.siteConfigService.create(createSiteConfigDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener todas las configuraciones del sitio',
    description: 'Retorna todas las configuraciones del sitio'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones del sitio',
    type: [SiteConfigResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async findAll(): Promise<SiteConfigResponseDto[]> {
    return this.siteConfigService.findAll();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Obtener configuraciones públicas del sitio',
    description: 'Retorna las configuraciones públicas del sitio (sin autenticación)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones públicas',
    type: [SiteConfigResponseDto]
  })
  async findPublicConfigs(): Promise<SiteConfigResponseDto[]> {
    return this.siteConfigService.findPublicConfigs();
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener configuraciones agrupadas por categoría',
    description: 'Retorna las configuraciones del sitio agrupadas por categoría'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones agrupadas por categoría',
    type: [SiteConfigCategoryDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async findByCategories(): Promise<SiteConfigCategoryDto[]> {
    return this.siteConfigService.findByCategories();
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener configuraciones por categoría',
    description: 'Retorna las configuraciones del sitio de una categoría específica'
  })
  @ApiParam({ name: 'category', description: 'Categoría de configuración' })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones de la categoría',
    type: [SiteConfigResponseDto]
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async findByCategory(@Param('category') category: string): Promise<SiteConfigResponseDto[]> {
    return this.siteConfigService.findByCategory(category);
  }

  @Get('key/:key')
  @ApiOperation({
    summary: 'Obtener configuración por clave (público)',
    description: 'Retorna una configuración específica por su clave'
  })
  @ApiParam({ name: 'key', description: 'Clave de la configuración' })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada',
    type: SiteConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  async findByKey(@Param('key') key: string): Promise<SiteConfigResponseDto | null> {
    return this.siteConfigService.findByKey(key);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener configuración del sitio por ID',
    description: 'Retorna una configuración específica del sitio'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración' })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada',
    type: SiteConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async findOne(@Param('id') id: string): Promise<SiteConfigResponseDto> {
    return this.siteConfigService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar configuración del sitio',
    description: 'Actualiza una configuración existente del sitio'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración' })
  @ApiBody({ type: UpdateSiteConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
    type: SiteConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async update(@Param('id') id: string, @Body() updateSiteConfigDto: UpdateSiteConfigDto): Promise<SiteConfigResponseDto> {
    return this.siteConfigService.update(id, updateSiteConfigDto);
  }

  @Patch('key/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar configuración por clave',
    description: 'Actualiza una configuración específica por su clave'
  })
  @ApiParam({ name: 'key', description: 'Clave de la configuración' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Nuevo valor de la configuración' }
      },
      required: ['value']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
    type: SiteConfigResponseDto
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async updateByKey(@Param('key') key: string, @Body() body: { value: string }): Promise<SiteConfigResponseDto> {
    return this.siteConfigService.updateByKey(key, body.value);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar configuración del sitio',
    description: 'Elimina una configuración del sitio del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración' })
  @ApiResponse({ status: 204, description: 'Configuración eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.siteConfigService.remove(id);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Inicializar configuraciones por defecto',
    description: 'Crea las configuraciones por defecto del sitio si no existen'
  })
  @ApiResponse({ status: 201, description: 'Configuraciones inicializadas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  async initializeDefaultConfigs(): Promise<{ message: string }> {
    await this.siteConfigService.initializeDefaultConfigs();
    return { message: 'Configuraciones por defecto inicializadas exitosamente' };
  }
} 