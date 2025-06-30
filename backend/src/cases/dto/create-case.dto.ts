import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty({
    description: 'Título del caso',
    example: 'Caso de divorcio - Pérez vs Pérez',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción detallada del caso',
    example: 'Proceso de divorcio por mutuo acuerdo con división de bienes',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID del cliente asociado al caso',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'ID del abogado asignado al caso',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  lawyerId: string;
} 