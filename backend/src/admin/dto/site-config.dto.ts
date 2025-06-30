import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateSiteConfigDto {
  @ApiProperty({ description: 'Clave única de configuración', example: 'site_name' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Valor de la configuración', example: 'Despacho Legal' })
  @IsString()
  value: string;

  @ApiProperty({ 
    description: 'Tipo de dato', 
    example: 'string',
    enum: ['string', 'image', 'color', 'boolean', 'json']
  })
  @IsString()
  type: string;

  @ApiProperty({ 
    description: 'Categoría de configuración', 
    example: 'branding',
    enum: ['branding', 'layout', 'contact', 'social', 'general']
  })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Descripción de la configuración', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Si se puede acceder sin autenticación', example: false })
  @IsBoolean()
  isPublic: boolean;
}

export class UpdateSiteConfigDto {
  @ApiProperty({ description: 'Valor de la configuración', example: 'Nuevo Nombre del Sitio', required: false })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ 
    description: 'Tipo de dato', 
    example: 'string',
    enum: ['string', 'image', 'color', 'boolean', 'json'],
    required: false
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ 
    description: 'Categoría de configuración', 
    example: 'branding',
    enum: ['branding', 'layout', 'contact', 'social', 'general'],
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Descripción de la configuración', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Si se puede acceder sin autenticación', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SiteConfigResponseDto {
  @ApiProperty({ description: 'ID de la configuración' })
  id: string;

  @ApiProperty({ description: 'Clave única de configuración' })
  key: string;

  @ApiProperty({ description: 'Valor de la configuración' })
  value: string;

  @ApiProperty({ description: 'Tipo de dato' })
  type: string;

  @ApiProperty({ description: 'Categoría de configuración' })
  category: string;

  @ApiProperty({ description: 'Descripción de la configuración' })
  description?: string;

  @ApiProperty({ description: 'Si se puede acceder sin autenticación' })
  isPublic: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}

export class SiteConfigCategoryDto {
  @ApiProperty({ description: 'Categoría' })
  category: string;

  @ApiProperty({ description: 'Configuraciones de la categoría', type: [SiteConfigResponseDto] })
  configs: SiteConfigResponseDto[];
} 