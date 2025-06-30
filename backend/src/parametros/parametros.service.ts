import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParametrosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.parametro.findMany();
  }

  async findOne(id: string) {
    const parametro = await this.prisma.parametro.findUnique({ where: { id } });
    if (!parametro) throw new NotFoundException('Parámetro no encontrado');
    return parametro;
  }

  async create(data: { clave: string; valor: string; etiqueta: string; tipo: string }) {
    return this.prisma.parametro.create({ data });
  }

  async update(id: string, data: { valor?: string; etiqueta?: string; tipo?: string }) {
    return this.prisma.parametro.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.parametro.delete({ where: { id } });
  }
} 