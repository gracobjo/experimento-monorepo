import { IsString, IsNotEmpty, IsDateString, IsNumber, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class InvoiceItemDto {
  @ApiProperty({
    description: 'Descripción del item',
    example: 'Servicios de asesoría legal',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Cantidad del item',
    example: 1,
    type: Number,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 100.00,
    type: Number,
  })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({
    description: 'Total del item',
    example: 100.00,
    type: Number,
  })
  @IsNumber()
  total: number;
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Número de factura',
    example: 'FAC-2024-001',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  numeroFactura?: string;

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2024-12-25',
    required: false,
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  fechaFactura?: string;

  @ApiProperty({
    description: 'Tipo de factura',
    example: 'FACTURA',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  tipoFactura: string;

  @ApiProperty({
    description: 'ID del emisor (se asigna automáticamente)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  emisorId?: string;

  @ApiProperty({
    description: 'ID del receptor',
    example: '123e4567-e89b-12d3-a456-426614174002',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  receptorId: string;

  @ApiProperty({
    description: 'ID del expediente asociado',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  expedienteId?: string;

  @ApiProperty({
    description: 'Importe total de la factura',
    example: 121.00,
    required: false,
    type: Number,
  })
  @IsOptional()
  importeTotal?: any;

  @ApiProperty({
    description: 'Base imponible',
    example: 100.00,
    required: false,
    type: Number,
  })
  @IsOptional()
  baseImponible?: any;

  @ApiProperty({
    description: 'Cuota de IVA',
    example: 21.00,
    required: false,
    type: Number,
  })
  @IsOptional()
  cuotaIVA?: any;

  @ApiProperty({
    description: 'Tipo de IVA (porcentaje)',
    example: 21,
    type: Number,
  })
  @IsNumber()
  tipoIVA: number;

  @ApiProperty({
    description: 'Régimen de IVA del emisor',
    example: '01',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  regimenIvaEmisor: string;

  @ApiProperty({
    description: 'Clave de operación',
    example: '01',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  claveOperacion: string;

  @ApiProperty({
    description: 'Método de pago',
    example: '01',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  metodoPago: string;

  @ApiProperty({
    description: 'Fecha de operación',
    example: '2024-12-25',
    type: String,
    format: 'date',
  })
  @IsDateString()
  fechaOperacion: string;

  @ApiProperty({
    description: 'Motivo de anulación',
    example: 'Error en datos',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  motivoAnulacion?: string;

  @ApiProperty({
    description: 'IDs de provisiones asociadas',
    example: ['123e4567-e89b-12d3-a456-426614174004'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  provisionIds?: string[];

  @ApiProperty({
    description: 'Descuento aplicado',
    example: 0,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  descuento?: number;

  @ApiProperty({
    description: 'Retención aplicada',
    example: 0,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  retencion?: number;

  @ApiProperty({
    description: 'Si se debe aplicar IVA',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  aplicarIVA?: boolean;

  @ApiProperty({
    description: 'Items de la factura',
    type: [InvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
} 