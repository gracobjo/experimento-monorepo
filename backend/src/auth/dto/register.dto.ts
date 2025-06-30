import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'nuevo@despacho.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6,
    type: String,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: Role,
    example: Role.CLIENTE,
  })
  @IsEnum(Role)
  role: Role;
} 