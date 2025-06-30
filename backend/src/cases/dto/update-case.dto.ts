import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCaseDto {
  @ApiProperty({
    description: 'Título del caso',
    example: 'Caso de divorcio - Pérez vs Pérez (Actualizado)',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Descripción detallada del caso',
    example: 'Proceso de divorcio por mutuo acuerdo con división de bienes - Actualizado',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID del cliente asociado al caso',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    type: String,
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'ID del abogado asignado al caso',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
    type: String,
  })
  @IsUUID()
  @IsOptional()
  lawyerId?: string;
} 