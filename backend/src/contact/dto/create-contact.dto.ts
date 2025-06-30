import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  asunto: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  mensaje: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
} 