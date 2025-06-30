import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLayoutDto, UpdateLayoutDto, LayoutConfigDto } from './dto/layout.dto';

@Injectable()
export class LayoutsService {
  constructor(private prisma: PrismaService) {}

  async create(createLayoutDto: CreateLayoutDto, userId: string): Promise<LayoutConfigDto> {
    // Verificar si ya existe un layout con el mismo slug
    const existingLayout = await this.prisma.layout.findFirst({
      where: {
        slug: this.generateSlug(createLayoutDto.name)
      }
    });

    if (existingLayout) {
      throw new ConflictException('Ya existe un layout con este nombre');
    }

    const layout = await this.prisma.layout.create({
      data: {
        name: createLayoutDto.name,
        slug: this.generateSlug(createLayoutDto.name),
        components: JSON.parse(JSON.stringify(createLayoutDto.components)),
        version: 1,
        isActive: false,
        createdBy: userId
      }
    });

    return this.mapToLayoutConfigDto(layout);
  }

  async findAll(): Promise<LayoutConfigDto[]> {
    const layouts = await this.prisma.layout.findMany({
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return layouts.map(layout => this.mapToLayoutConfigDto(layout));
  }

  async findOne(id: string): Promise<LayoutConfigDto> {
    const layout = await this.prisma.layout.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!layout) {
      throw new NotFoundException(`Layout con ID ${id} no encontrado`);
    }

    return this.mapToLayoutConfigDto(layout);
  }

  async findBySlug(slug: string): Promise<LayoutConfigDto> {
    const layout = await this.prisma.layout.findUnique({
      where: { slug },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!layout) {
      throw new NotFoundException(`Layout con slug ${slug} no encontrado`);
    }

    return this.mapToLayoutConfigDto(layout);
  }

  async findActiveLayout(slug: string): Promise<LayoutConfigDto | null> {
    const layout = await this.prisma.layout.findFirst({
      where: {
        slug,
        isActive: true
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return layout ? this.mapToLayoutConfigDto(layout) : null;
  }

  async update(id: string, updateLayoutDto: UpdateLayoutDto, userId: string): Promise<LayoutConfigDto> {
    const existingLayout = await this.prisma.layout.findUnique({
      where: { id }
    });

    if (!existingLayout) {
      throw new NotFoundException(`Layout con ID ${id} no encontrado`);
    }

    // Si se está actualizando el nombre, verificar que no haya conflictos
    if (updateLayoutDto.name && updateLayoutDto.name !== existingLayout.name) {
      const slug = this.generateSlug(updateLayoutDto.name);
      const conflictingLayout = await this.prisma.layout.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });

      if (conflictingLayout) {
        throw new ConflictException('Ya existe un layout con este nombre');
      }
    }

    const layout = await this.prisma.layout.update({
      where: { id },
      data: {
        name: updateLayoutDto.name,
        slug: updateLayoutDto.name ? this.generateSlug(updateLayoutDto.name) : undefined,
        components: updateLayoutDto.components ? JSON.parse(JSON.stringify(updateLayoutDto.components)) : undefined,
        version: {
          increment: 1
        },
        updatedAt: new Date()
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return this.mapToLayoutConfigDto(layout);
  }

  async activate(id: string): Promise<LayoutConfigDto> {
    // Desactivar todos los layouts con el mismo slug
    const layout = await this.prisma.layout.findUnique({
      where: { id }
    });

    if (!layout) {
      throw new NotFoundException(`Layout con ID ${id} no encontrado`);
    }

    await this.prisma.layout.updateMany({
      where: {
        slug: layout.slug
      },
      data: {
        isActive: false
      }
    });

    // Activar el layout específico
    const activatedLayout = await this.prisma.layout.update({
      where: { id },
      data: {
        isActive: true
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return this.mapToLayoutConfigDto(activatedLayout);
  }

  async deactivate(id: string): Promise<LayoutConfigDto> {
    const layout = await this.prisma.layout.update({
      where: { id },
      data: {
        isActive: false
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return this.mapToLayoutConfigDto(layout);
  }

  async remove(id: string): Promise<void> {
    const layout = await this.prisma.layout.findUnique({
      where: { id }
    });

    if (!layout) {
      throw new NotFoundException(`Layout con ID ${id} no encontrado`);
    }

    await this.prisma.layout.delete({
      where: { id }
    });
  }

  async duplicate(id: string, userId: string): Promise<LayoutConfigDto> {
    const originalLayout = await this.prisma.layout.findUnique({
      where: { id }
    });

    if (!originalLayout) {
      throw new NotFoundException(`Layout con ID ${id} no encontrado`);
    }

    const duplicatedLayout = await this.prisma.layout.create({
      data: {
        name: `${originalLayout.name} (Copia)`,
        slug: this.generateSlug(`${originalLayout.name} (Copia)`),
        components: originalLayout.components,
        version: 1,
        isActive: false,
        createdBy: userId
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return this.mapToLayoutConfigDto(duplicatedLayout);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private mapToLayoutConfigDto(layout: any): LayoutConfigDto {
    return {
      id: layout.id,
      name: layout.name,
      components: layout.components as any[],
      version: layout.version,
      lastModified: layout.updatedAt.toISOString(),
      userId: layout.createdBy
    };
  }
} 