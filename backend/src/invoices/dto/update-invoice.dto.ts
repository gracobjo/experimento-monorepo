import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
 
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiProperty({
    description: 'ID de la factura',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
    type: String,
  })
  id?: string;
} 