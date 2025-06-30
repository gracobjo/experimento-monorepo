import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateMenuConfigDto, UpdateMenuConfigDto, MenuConfigResponseDto, MenuItemDto } from './dto/menu-config.dto';

@Injectable()
export class MenuConfigService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuConfigDto: CreateMenuConfigDto, userId: string): Promise<MenuConfigResponseDto> {
    const { items, ...menuData } = createMenuConfigDto;

    // Verificar que no exista un menú activo para el mismo rol
    const existingMenu = await this.prisma.menuConfig.findFirst({
      where: {
        role: menuData.role,
        isActive: true
      }
    });

    if (existingMenu) {
      throw new BadRequestException(`Ya existe un menú activo para el rol ${menuData.role}`);
    }

    // Crear el menú con sus elementos
    const menuConfig = await this.prisma.menuConfig.create({
      data: {
        ...menuData,
        items: {
          create: items.map((item, index) => ({
            label: item.label,
            url: item.url,
            icon: item.icon,
            order: item.order || index,
            isVisible: item.isVisible,
            isExternal: item.isExternal,
            parentId: item.parentId
          }))
        }
      },
      include: {
        items: {
          include: {
            children: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return this.mapToResponseDto(menuConfig);
  }

  async findAll(): Promise<MenuConfigResponseDto[]> {
    const menuConfigs = await this.prisma.menuConfig.findMany({
      include: {
        items: {
          include: {
            children: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return menuConfigs.map(menu => this.mapToResponseDto(menu));
  }

  async findByRole(role: Role): Promise<MenuConfigResponseDto | null> {
    const menuConfig = await this.prisma.menuConfig.findFirst({
      where: {
        role,
        isActive: true
      },
      include: {
        items: {
          where: {
            isVisible: true,
            parentId: null // Solo elementos de primer nivel
          },
          include: {
            children: {
              where: {
                isVisible: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return menuConfig ? this.mapToResponseDto(menuConfig) : null;
  }

  async findOne(id: string): Promise<MenuConfigResponseDto> {
    const menuConfig = await this.prisma.menuConfig.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            children: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!menuConfig) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(menuConfig);
  }

  async update(id: string, updateMenuConfigDto: UpdateMenuConfigDto): Promise<MenuConfigResponseDto> {
    const existingMenu = await this.prisma.menuConfig.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingMenu) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    const { items, ...menuData } = updateMenuConfigDto;

    // Si se está activando este menú, desactivar otros del mismo rol
    if (menuData.isActive && existingMenu.role) {
      await this.prisma.menuConfig.updateMany({
        where: {
          role: existingMenu.role,
          id: { not: id }
        },
        data: {
          isActive: false
        }
      });
    }

    // Actualizar el menú
    const updatedMenu = await this.prisma.menuConfig.update({
      where: { id },
      data: menuData,
      include: {
        items: {
          include: {
            children: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    // Si se proporcionaron nuevos elementos, actualizarlos
    if (items) {
      // Eliminar elementos existentes
      await this.prisma.menuItem.deleteMany({
        where: { menuConfigId: id }
      });

      // Crear nuevos elementos
      await this.prisma.menuItem.createMany({
        data: items.map((item, index) => ({
          menuConfigId: id,
          label: item.label,
          url: item.url,
          icon: item.icon,
          order: item.order || index,
          isVisible: item.isVisible,
          isExternal: item.isExternal,
          parentId: item.parentId
        }))
      });

      // Recargar el menú con los nuevos elementos
      return this.findOne(id);
    }

    return this.mapToResponseDto(updatedMenu);
  }

  async remove(id: string): Promise<void> {
    const menuConfig = await this.prisma.menuConfig.findUnique({
      where: { id }
    });

    if (!menuConfig) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    await this.prisma.menuConfig.delete({
      where: { id }
    });
  }

  async getDefaultMenus(): Promise<{ role: Role; items: MenuItemDto[] }[]> {
    return [
      {
        role: Role.ADMIN,
        items: [
          { label: 'Dashboard', url: '/admin/dashboard', icon: '🏠', order: 0, isVisible: true, isExternal: false },
          { label: 'Usuarios', url: '/admin/users', icon: '👥', order: 1, isVisible: true, isExternal: false },
          { label: 'Expedientes', url: '/admin/cases', icon: '📋', order: 2, isVisible: true, isExternal: false },
          { label: 'Citas', url: '/admin/appointments', icon: '📅', order: 3, isVisible: true, isExternal: false },
          { label: 'Tareas', url: '/admin/tasks', icon: '✅', order: 4, isVisible: true, isExternal: false },
          { label: 'Documentos', url: '/admin/documents', icon: '📄', order: 5, isVisible: true, isExternal: false },
          { label: 'Reportes', url: '/admin/reports', icon: '📊', order: 6, isVisible: true, isExternal: false },
          { label: 'Configuración', url: '/admin/parametros', icon: '⚙️', order: 7, isVisible: true, isExternal: false }
        ]
      },
      {
        role: Role.ABOGADO,
        items: [
          { label: 'Dashboard', url: '/dashboard', icon: '🏠', order: 0, isVisible: true, isExternal: false },
          { label: 'Mis Expedientes', url: '/lawyer/cases', icon: '📋', order: 1, isVisible: true, isExternal: false },
          { label: 'Citas', url: '/lawyer/appointments', icon: '📅', order: 2, isVisible: true, isExternal: false },
          { label: 'Tareas', url: '/lawyer/tasks', icon: '✅', order: 3, isVisible: true, isExternal: false },
          { label: 'Chat', url: '/lawyer/chat', icon: '💬', order: 4, isVisible: true, isExternal: false },
          { label: 'Reportes', url: '/lawyer/reports', icon: '📊', order: 5, isVisible: true, isExternal: false },
          { 
            label: 'Facturación', 
            url: '#', 
            icon: '🧾', 
            order: 6, 
            isVisible: true, 
            isExternal: false,
            children: [
              { label: 'Provisión de Fondos', url: '/lawyer/provisiones', icon: '💰', order: 0, isVisible: true, isExternal: false },
              { label: 'Facturación Electrónica', url: '/lawyer/facturacion', icon: '📄', order: 1, isVisible: true, isExternal: false }
            ]
          }
        ]
      },
      {
        role: Role.CLIENTE,
        items: [
          { label: 'Dashboard', url: '/dashboard', icon: '🏠', order: 0, isVisible: true, isExternal: false },
          { label: 'Mis Expedientes', url: '/client/cases', icon: '📋', order: 1, isVisible: true, isExternal: false },
          { label: 'Provisiones', url: '/client/provisiones', icon: '💰', order: 2, isVisible: true, isExternal: false },
          { label: 'Mis Citas', url: '/client/appointments', icon: '📅', order: 3, isVisible: true, isExternal: false },
          { label: 'Chat', url: '/client/chat', icon: '💬', order: 4, isVisible: true, isExternal: false }
        ]
      }
    ];
  }

  private mapToResponseDto(menuConfig: any): MenuConfigResponseDto {
    return {
      id: menuConfig.id,
      name: menuConfig.name,
      role: menuConfig.role,
      orientation: menuConfig.orientation,
      isActive: menuConfig.isActive,
      items: menuConfig.items.map((item: any) => ({
        id: item.id,
        label: item.label,
        url: item.url,
        icon: item.icon,
        order: item.order,
        isVisible: item.isVisible,
        isExternal: item.isExternal,
        parentId: item.parentId,
        children: item.children?.map((child: any) => ({
          id: child.id,
          label: child.label,
          url: child.url,
          icon: child.icon,
          order: child.order,
          isVisible: child.isVisible,
          isExternal: child.isExternal,
          parentId: child.parentId
        })) || []
      })),
      createdAt: menuConfig.createdAt,
      updatedAt: menuConfig.updatedAt
    };
  }
} 