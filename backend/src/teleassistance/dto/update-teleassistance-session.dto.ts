import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateTeleassistanceSessionDto {
  @ApiProperty({
    description: 'Estado de la sesión de teleasistencia',
    enum: SessionStatus,
    example: SessionStatus.ACTIVE,
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiProperty({
    description: 'Resolución del problema al finalizar la sesión',
    example: 'Problema resuelto: Autofirma instalado correctamente',
  })
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiProperty({
    description: 'Notas adicionales del asistente',
    example: 'Usuario necesitaba actualizar Java para que funcionara Autofirma',
  })
  @IsString()
  @IsOptional()
  notes?: string;
} 