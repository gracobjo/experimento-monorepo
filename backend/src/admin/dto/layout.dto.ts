import { IsString, IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ComponentConfigDto {
  @ApiProperty({
    description: 'ID único del componente',
    example: 'component-1234567890'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Tipo de componente',
    example: 'hero-banner',
    enum: ['hero-banner', 'service-cards', 'contact-form', 'testimonials', 'stats', 'text-block', 'image-gallery', 'map', 'divider', 'spacer']
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Propiedades del componente',
    example: { title: 'Bienvenido', subtitle: 'Servicios legales' }
  })
  props: any;

  @ApiProperty({
    description: 'Orden del componente en el layout',
    example: 0
  })
  @IsNumber()
  order: number;
}

export class LayoutConfigDto {
  @ApiProperty({
    description: 'ID único del layout',
    example: 'home-layout'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Nombre del layout',
    example: 'Home Page'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Lista de componentes del layout',
    type: [ComponentConfigDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentConfigDto)
  components: ComponentConfigDto[];

  @ApiProperty({
    description: 'Versión del layout',
    example: 1
  })
  @IsNumber()
  version: number;

  @ApiProperty({
    description: 'Fecha de última modificación',
    example: '2024-12-25T10:00:00.000Z'
  })
  @IsString()
  lastModified: string;

  @ApiProperty({
    description: 'ID del usuario que creó/modificó el layout',
    example: 'user-123'
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreateLayoutDto {
  @ApiProperty({
    description: 'Nombre del layout',
    example: 'Home Page'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Lista de componentes del layout',
    type: [ComponentConfigDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentConfigDto)
  components: ComponentConfigDto[];
}

export class UpdateLayoutDto {
  @ApiProperty({
    description: 'Nombre del layout',
    example: 'Home Page Updated'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Lista de componentes del layout',
    type: [ComponentConfigDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentConfigDto)
  components?: ComponentConfigDto[];
} 