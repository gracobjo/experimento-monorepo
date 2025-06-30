import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID del abogado para la cita',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsString()
  lawyerId: string;

  @ApiProperty({
    description: 'Fecha y hora de la cita',
    example: '2024-12-25T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Ubicación de la cita',
    example: 'Oficina principal - Calle Mayor 123',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Notas adicionales sobre la cita',
    example: 'Traer documentación del caso de divorcio',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  notes?: string;
} 