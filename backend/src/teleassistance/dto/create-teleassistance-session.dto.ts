import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum IssueType {
  AUTOFIRMA = 'AUTOFIRMA',
  CERTIFICADO_DIGITAL = 'CERTIFICADO_DIGITAL',
  SEDES = 'SEDES',
  CLAVE_PIN = 'CLAVE_PIN',
  NAVEGADOR = 'NAVEGADOR',
  SISTEMA_OPERATIVO = 'SISTEMA_OPERATIVO',
  OTRO = 'OTRO',
}

export enum RemoteTool {
  REMOTELY_ANYWHERE = 'REMOTELY_ANYWHERE',
  TEAMVIEWER_QUICKSUPPORT = 'TEAMVIEWER_QUICKSUPPORT',
  ANYDESK = 'ANYDESK',
  CHROME_REMOTE_DESKTOP = 'CHROME_REMOTE_DESKTOP',
  OTRO = 'OTRO',
}

export class CreateTeleassistanceSessionDto {
  @ApiProperty({
    description: 'ID del usuario que solicita la teleasistencia',
    example: 'user-id-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID del asistente que proporcionará la teleasistencia',
    example: 'assistant-id-456',
  })
  @IsString()
  @IsNotEmpty()
  assistantId: string;

  @ApiProperty({
    description: 'Tipo de problema que necesita asistencia',
    enum: IssueType,
    example: IssueType.AUTOFIRMA,
  })
  @IsEnum(IssueType)
  issueType: IssueType;

  @ApiProperty({
    description: 'Descripción detallada del problema',
    example: 'No puedo instalar Autofirma en mi ordenador',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Herramienta de control remoto preferida',
    enum: RemoteTool,
    example: RemoteTool.REMOTELY_ANYWHERE,
  })
  @IsEnum(RemoteTool)
  @IsOptional()
  remoteTool?: RemoteTool;
} 