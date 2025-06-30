import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProvisionFondosDto } from './dto/create-provision-fondos.dto';

@Injectable()
export class ProvisionFondosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProvisionFondosDto) {
    return this.prisma.provisionFondos.create({
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findAll(options: { clientId?: string; expedienteId?: string; invoiceId?: string; soloPendientes?: boolean }) {
    const where: any = {};
    if (options.clientId) where.clientId = options.clientId;
    if (options.expedienteId) where.expedienteId = options.expedienteId;
    if (options.invoiceId) where.invoiceId = options.invoiceId;
    if (options.soloPendientes) where.invoiceId = null;
    return this.prisma.provisionFondos.findMany({
      where,
      include: { 
        invoice: true, 
        expediente: {
          include: {
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        } 
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.provisionFondos.findUnique({
      where: { id },
      include: { 
        invoice: true, 
        expediente: {
          include: {
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        } 
      },
    });
  }

  async linkToInvoice(provisionId: string, invoiceId: string) {
    return this.prisma.provisionFondos.update({
      where: { id: provisionId },
      data: { invoiceId },
      include: { 
        invoice: true,
        expediente: {
          include: {
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        } 
      },
    });
  }
}