import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Título del documento',
    example: 'Contrato de arrendamiento',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'ID del expediente asociado',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  expedienteId: string;

  @ApiProperty({
    description: 'Descripción del documento',
    example: 'Contrato de arrendamiento del local comercial',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;
} 