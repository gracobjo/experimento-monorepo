import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProvisionFondosDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsString()
  clientId: string;

  @ApiProperty({
    description: 'ID del expediente asociado',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  expedienteId?: string;

  @ApiProperty({
    description: 'ID de la factura asociada',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiProperty({
    description: 'Monto de la provisión',
    example: 1000.00,
    type: Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Fecha de la provisión',
    example: '2024-12-25',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Descripción de la provisión',
    example: 'Provisión para gastos de asesoría legal',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 