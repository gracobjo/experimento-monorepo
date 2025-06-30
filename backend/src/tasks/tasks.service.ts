import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskPriority, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, currentUserId: string) {
    // Verificar que el expediente existe si se proporciona
    if (createTaskDto.expedienteId) {
      const expediente = await this.prisma.expediente.findUnique({
        where: { id: createTaskDto.expedienteId }
      });
      
      if (!expediente) {
        throw new NotFoundException('Expediente no encontrado');
      }
    }

    // Verificar que el cliente existe si se proporciona
    if (createTaskDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: createTaskDto.clientId }
      });
      
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
    }

    // Verificar que el usuario asignado existe si se proporciona
    if (createTaskDto.assignedTo) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: createTaskDto.assignedTo }
      });
      
      if (!assignedUser) {
        throw new NotFoundException('Usuario asignado no encontrado');
      }
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        priority: createTaskDto.priority || TaskPriority.MEDIA,
        status: TaskStatus.PENDIENTE,
        expedienteId: createTaskDto.expedienteId,
        clientId: createTaskDto.clientId,
        assignedTo: createTaskDto.assignedTo || currentUserId,
        createdBy: currentUserId,
      },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });
  }

  async findAll(currentUserId: string, userRole: string) {
    let whereClause: any = {};

    // Filtrar por rol del usuario
    if (userRole === 'ABOGADO') {
      // Abogados ven tareas asignadas a ellos o creadas por ellos
      whereClause = {
        OR: [
          { assignedTo: currentUserId },
          { createdBy: currentUserId }
        ]
      };
    }
    // Los admins ven todas las tareas (whereClause vacío)

    return this.prisma.task.findMany({
      where: whereClause,
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    });
  }

  async findOne(id: string, currentUserId: string, userRole: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar permisos
    if (userRole === 'ABOGADO') {
      if (task.assignedTo !== currentUserId && task.createdBy !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver esta tarea');
      }
    }
    // Los admins pueden ver cualquier tarea

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, currentUserId: string, userRole: string) {
    // Verificar que la tarea existe
    const existingTask = await this.prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar permisos
    if (userRole === 'ABOGADO') {
      if (existingTask.assignedTo !== currentUserId && existingTask.createdBy !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para editar esta tarea');
      }
    }
    // Los admins pueden editar cualquier tarea

    // Verificar que el expediente existe si se está actualizando
    if (updateTaskDto.expedienteId) {
      const expediente = await this.prisma.expediente.findUnique({
        where: { id: updateTaskDto.expedienteId }
      });
      
      if (!expediente) {
        throw new NotFoundException('Expediente no encontrado');
      }
    }

    // Verificar que el cliente existe si se está actualizando
    if (updateTaskDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateTaskDto.clientId }
      });
      
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
    }

    // Verificar que el usuario asignado existe si se está actualizando
    if (updateTaskDto.assignedTo) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: updateTaskDto.assignedTo }
      });
      
      if (!assignedUser) {
        throw new NotFoundException('Usuario asignado no encontrado');
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
      },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });
  }

  async remove(id: string, currentUserId: string, userRole: string) {
    // Verificar que la tarea existe
    const existingTask = await this.prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Solo los creadores o admins pueden eliminar tareas
    if (userRole !== 'ADMIN' && existingTask.createdBy !== currentUserId) {
      throw new ForbiddenException('Solo puedes eliminar tareas que hayas creado');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: TaskStatus, currentUserId: string, userRole: string) {
    // Verificar que la tarea existe
    const existingTask = await this.prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar permisos
    if (userRole === 'ABOGADO') {
      if (existingTask.assignedTo !== currentUserId && existingTask.createdBy !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para cambiar el estado de esta tarea');
      }
    }
    // Los admins pueden cambiar cualquier estado

    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });
  }

  async getTasksByStatus(status: TaskStatus, currentUserId: string, userRole: string) {
    let whereClause: any = { status };

    // Filtrar por rol del usuario
    if (userRole === 'ABOGADO') {
      whereClause = {
        ...whereClause,
        OR: [
          { assignedTo: currentUserId },
          { createdBy: currentUserId }
        ]
      };
    }
    // Los admins ven todas las tareas con ese estado

    return this.prisma.task.findMany({
      where: whereClause,
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    });
  }

  async getTasksStats(currentUserId: string, userRole: string) {
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'ABOGADO') {
      whereClause = {
        OR: [
          { assignedTo: currentUserId },
          { createdBy: currentUserId }
        ]
      };
    }
    // Los admins ven estadísticas de todas las tareas

    const [total, pendientes, enProgreso, completadas, canceladas, vencidas] = await Promise.all([
      this.prisma.task.count({ where: whereClause }),
      this.prisma.task.count({ where: { ...whereClause, status: TaskStatus.PENDIENTE } }),
      this.prisma.task.count({ where: { ...whereClause, status: TaskStatus.EN_PROGRESO } }),
      this.prisma.task.count({ where: { ...whereClause, status: TaskStatus.COMPLETADA } }),
      this.prisma.task.count({ where: { ...whereClause, status: TaskStatus.CANCELADA } }),
      this.prisma.task.count({
        where: {
          ...whereClause,
          dueDate: {
            lt: new Date()
          },
          status: {
            not: TaskStatus.COMPLETADA
          }
        }
      }),
    ]);

    return {
      total,
      pendientes,
      enProgreso,
      completadas,
      canceladas,
      vencidas,
    };
  }

  async getUpcomingTasks(currentUserId: string, userRole: string, days: number = 7) {
    let whereClause: any = {
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      },
      status: {
        not: TaskStatus.COMPLETADA
      }
    };

    // Filtrar por rol del usuario
    if (userRole === 'ABOGADO') {
      whereClause = {
        ...whereClause,
        OR: [
          { assignedTo: currentUserId },
          { createdBy: currentUserId }
        ]
      };
    }
    // Los admins ven todas las tareas próximas

    return this.prisma.task.findMany({
      where: whereClause,
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ],
    });
  }
} 