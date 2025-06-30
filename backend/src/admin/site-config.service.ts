import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteConfigDto, UpdateSiteConfigDto, SiteConfigResponseDto, SiteConfigCategoryDto } from './dto/site-config.dto';

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

  async create(createSiteConfigDto: CreateSiteConfigDto): Promise<SiteConfigResponseDto> {
    // Verificar que no exista una configuración con la misma clave
    const existingConfig = await this.prisma.siteConfig.findUnique({
      where: { key: createSiteConfigDto.key }
    });

    if (existingConfig) {
      throw new BadRequestException(`Ya existe una configuración con la clave ${createSiteConfigDto.key}`);
    }

    const siteConfig = await this.prisma.siteConfig.create({
      data: createSiteConfigDto
    });

    return this.mapToResponseDto(siteConfig);
  }

  async findAll(): Promise<SiteConfigResponseDto[]> {
    const siteConfigs = await this.prisma.siteConfig.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    return siteConfigs.map(config => this.mapToResponseDto(config));
  }

  async findByCategory(category: string): Promise<SiteConfigResponseDto[]> {
    const siteConfigs = await this.prisma.siteConfig.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    });

    return siteConfigs.map(config => this.mapToResponseDto(config));
  }

  async findByCategories(): Promise<SiteConfigCategoryDto[]> {
    const siteConfigs = await this.prisma.siteConfig.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Agrupar por categoría
    const groupedConfigs = siteConfigs.reduce((acc, config) => {
      const category = config.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(this.mapToResponseDto(config));
      return acc;
    }, {} as Record<string, SiteConfigResponseDto[]>);

    return Object.entries(groupedConfigs).map(([category, configs]) => ({
      category,
      configs
    }));
  }

  async findPublicConfigs(): Promise<SiteConfigResponseDto[]> {
    const siteConfigs = await this.prisma.siteConfig.findMany({
      where: { isPublic: true },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    return siteConfigs.map(config => this.mapToResponseDto(config));
  }

  async findOne(id: string): Promise<SiteConfigResponseDto> {
    const siteConfig = await this.prisma.siteConfig.findUnique({
      where: { id }
    });

    if (!siteConfig) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(siteConfig);
  }

  async findByKey(key: string): Promise<SiteConfigResponseDto | null> {
    const siteConfig = await this.prisma.siteConfig.findUnique({
      where: { key }
    });

    return siteConfig ? this.mapToResponseDto(siteConfig) : null;
  }

  async update(id: string, updateSiteConfigDto: UpdateSiteConfigDto): Promise<SiteConfigResponseDto> {
    const existingConfig = await this.prisma.siteConfig.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    const siteConfig = await this.prisma.siteConfig.update({
      where: { id },
      data: updateSiteConfigDto
    });

    return this.mapToResponseDto(siteConfig);
  }

  async updateByKey(key: string, value: string): Promise<SiteConfigResponseDto> {
    const existingConfig = await this.prisma.siteConfig.findUnique({
      where: { key }
    });

    if (!existingConfig) {
      throw new NotFoundException(`Configuración con clave ${key} no encontrada`);
    }

    const siteConfig = await this.prisma.siteConfig.update({
      where: { key },
      data: { value }
    });

    return this.mapToResponseDto(siteConfig);
  }

  async remove(id: string): Promise<void> {
    const siteConfig = await this.prisma.siteConfig.findUnique({
      where: { id }
    });

    if (!siteConfig) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    await this.prisma.siteConfig.delete({
      where: { id }
    });
  }

  async initializeDefaultConfigs(): Promise<void> {
    const defaultConfigs = [
      // Configuraciones de marca
      {
        key: 'site_name',
        value: 'Despacho Legal',
        type: 'string',
        category: 'branding',
        description: 'Nombre del sitio web',
        isPublic: true
      },
      {
        key: 'site_description',
        value: 'Servicios legales profesionales y confiables',
        type: 'string',
        category: 'branding',
        description: 'Descripción del sitio web',
        isPublic: true
      },
      {
        key: 'logo_url',
        value: '/images/logo.png',
        type: 'image',
        category: 'branding',
        description: 'URL del logo de la empresa',
        isPublic: true
      },
      {
        key: 'favicon_url',
        value: '/images/favicon.ico',
        type: 'image',
        category: 'branding',
        description: 'URL del favicon',
        isPublic: true
      },
      {
        key: 'primary_color',
        value: '#1e40af',
        type: 'color',
        category: 'branding',
        description: 'Color primario del sitio',
        isPublic: true
      },
      {
        key: 'secondary_color',
        value: '#3b82f6',
        type: 'color',
        category: 'branding',
        description: 'Color secundario del sitio',
        isPublic: true
      },

      // Configuraciones de layout
      {
        key: 'sidebar_position',
        value: 'left',
        type: 'string',
        category: 'layout',
        description: 'Posición del sidebar (left, right)',
        isPublic: false
      },
      {
        key: 'sidebar_width',
        value: '250px',
        type: 'string',
        category: 'layout',
        description: 'Ancho del sidebar',
        isPublic: false
      },
      {
        key: 'header_fixed',
        value: 'true',
        type: 'boolean',
        category: 'layout',
        description: 'Si el header debe estar fijo',
        isPublic: false
      },
      {
        key: 'footer_visible',
        value: 'true',
        type: 'boolean',
        category: 'layout',
        description: 'Si el footer debe ser visible',
        isPublic: false
      },

      // Configuraciones de contacto
      {
        key: 'contact_email',
        value: 'info@despacholegal.com',
        type: 'email',
        category: 'contact',
        description: 'Email de contacto principal',
        isPublic: true
      },
      {
        key: 'contact_phone',
        value: '+34 123 456 789',
        type: 'string',
        category: 'contact',
        description: 'Teléfono de contacto',
        isPublic: true
      },
      {
        key: 'contact_address',
        value: 'Calle Principal 123, Madrid',
        type: 'string',
        category: 'contact',
        description: 'Dirección de contacto',
        isPublic: true
      },
      {
        key: 'office_hours',
        value: 'Lunes a Viernes: 9:00 - 18:00',
        type: 'string',
        category: 'contact',
        description: 'Horario de oficina',
        isPublic: true
      },

      // Configuraciones sociales
      {
        key: 'social_facebook',
        value: 'https://facebook.com/despacholegal',
        type: 'string',
        category: 'social',
        description: 'URL de Facebook',
        isPublic: true
      },
      {
        key: 'social_twitter',
        value: 'https://twitter.com/despacholegal',
        type: 'string',
        category: 'social',
        description: 'URL de Twitter',
        isPublic: true
      },
      {
        key: 'social_linkedin',
        value: 'https://linkedin.com/company/despacholegal',
        type: 'string',
        category: 'social',
        description: 'URL de LinkedIn',
        isPublic: true
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/despacholegal',
        type: 'string',
        category: 'social',
        description: 'URL de Instagram',
        isPublic: true
      },

      // Configuraciones generales
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        category: 'general',
        description: 'Modo mantenimiento',
        isPublic: false
      },
      {
        key: 'default_language',
        value: 'es',
        type: 'string',
        category: 'general',
        description: 'Idioma por defecto',
        isPublic: true
      },
      {
        key: 'timezone',
        value: 'Europe/Madrid',
        type: 'string',
        category: 'general',
        description: 'Zona horaria del sitio',
        isPublic: false
      },
      {
        key: 'date_format',
        value: 'DD/MM/YYYY',
        type: 'string',
        category: 'general',
        description: 'Formato de fecha',
        isPublic: false
      }
    ];

    for (const config of defaultConfigs) {
      const existingConfig = await this.prisma.siteConfig.findUnique({
        where: { key: config.key }
      });

      if (!existingConfig) {
        await this.prisma.siteConfig.create({
          data: config
        });
      }
    }
  }

  private mapToResponseDto(siteConfig: any): SiteConfigResponseDto {
    return {
      id: siteConfig.id,
      key: siteConfig.key,
      value: siteConfig.value,
      type: siteConfig.type,
      category: siteConfig.category,
      description: siteConfig.description,
      isPublic: siteConfig.isPublic,
      createdAt: siteConfig.createdAt,
      updatedAt: siteConfig.updatedAt
    };
  }
} 