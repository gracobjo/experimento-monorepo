import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class MenuItemDto {
  @ApiProperty({ description: 'ID del elemento del menú' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Texto visible del enlace', example: 'Dashboard' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'URL de destino', example: '/dashboard' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Icono (emoji o clase CSS)', example: '🏠', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Orden de aparición', example: 1 })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ description: 'Si el elemento es visible', example: true })
  @IsBoolean()
  isVisible: boolean;

  @ApiProperty({ description: 'Si es enlace externo', example: false })
  @IsBoolean()
  isExternal: boolean;

  @ApiProperty({ description: 'ID del elemento padre (para submenús)', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: 'Elementos hijos (submenús)', type: [MenuItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  children?: MenuItemDto[];
}

export class CreateMenuConfigDto {
  @ApiProperty({ description: 'Nombre del menú', example: 'main-nav' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Rol para el que es el menú', enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Orientación del menú', example: 'horizontal', enum: ['horizontal', 'vertical'] })
  @IsString()
  orientation: string;

  @ApiProperty({ description: 'Si el menú está activo', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Elementos del menú', type: [MenuItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  items: MenuItemDto[];
}

export class UpdateMenuConfigDto {
  @ApiProperty({ description: 'Nombre del menú', example: 'main-nav', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Rol para el que es el menú', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ description: 'Orientación del menú', example: 'vertical', required: false })
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiProperty({ description: 'Si el menú está activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Elementos del menú', type: [MenuItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  items?: MenuItemDto[];
}

export class MenuConfigResponseDto {
  @ApiProperty({ description: 'ID del menú' })
  id: string;

  @ApiProperty({ description: 'Nombre del menú' })
  name: string;

  @ApiProperty({ description: 'Rol para el que es el menú' })
  role: Role;

  @ApiProperty({ description: 'Orientación del menú' })
  orientation: string;

  @ApiProperty({ description: 'Si el menú está activo' })
  isActive: boolean;

  @ApiProperty({ description: 'Elementos del menú', type: [MenuItemDto] })
  items: MenuItemDto[];

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
} 