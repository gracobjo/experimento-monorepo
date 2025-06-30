import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findClients() {
    return this.prisma.client.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            expedientes: true,
            appointments: true,
          }
        }
      }
    });
  }

  async findClientsByLawyer(lawyerId: string) {
    return this.prisma.client.findMany({
      where: {
        expedientes: {
          some: {
            lawyerId: lawyerId
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            expedientes: {
              where: {
                lawyerId: lawyerId
              }
            },
            appointments: {
              where: {
                lawyerId: lawyerId
              }
            },
          }
        }
      }
    });
  }

  async getClientStats(lawyerId?: string) {
    const whereClause = lawyerId ? {
      expedientes: {
        some: {
          lawyerId: lawyerId
        }
      }
    } : {};

    const [total, active, totalCases, totalAppointments] = await Promise.all([
      this.prisma.client.count({ where: whereClause }),
      this.prisma.client.count({
        where: {
          ...whereClause,
          expedientes: {
            some: lawyerId ? { lawyerId } : {}
          }
        }
      }),
      this.prisma.expediente.count({
        where: lawyerId ? { lawyerId } : {}
      }),
      this.prisma.appointment.count({
        where: lawyerId ? { lawyerId } : {}
      })
    ]);

    return {
      total,
      active,
      inactive: total - active,
      totalCases,
      totalAppointments,
      averageCasesPerClient: total > 0 ? parseFloat((totalCases / total).toFixed(1)) : 0
    };
  }

  async getClientReport(lawyerId?: string) {
    const whereClause = lawyerId ? {
      expedientes: {
        some: {
          lawyerId: lawyerId
        }
      }
    } : {};

    const clients = await this.prisma.client.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        expedientes: {
          where: lawyerId ? { lawyerId } : {},
          include: {
            documents: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        appointments: {
          where: lawyerId ? { lawyerId } : {},
          orderBy: {
            date: 'desc'
          }
        },
        _count: {
          select: {
            expedientes: {
              where: lawyerId ? { lawyerId } : {}
            },
            appointments: {
              where: lawyerId ? { lawyerId } : {}
            },
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    return clients.map(client => ({
      id: client.id,
      name: client.user.name,
      email: client.user.email,
      dni: client.dni,
      phone: client.phone,
      address: client.address,
      totalCases: client._count.expedientes,
      totalAppointments: client._count.appointments,
      lastCase: client.expedientes[0] ? {
        id: client.expedientes[0].id,
        title: client.expedientes[0].title,
        status: client.expedientes[0].status,
        createdAt: client.expedientes[0].createdAt
      } : null,
      lastAppointment: client.appointments[0] ? {
        id: client.appointments[0].id,
        date: client.appointments[0].date,
        location: client.appointments[0].location
      } : null,
      totalDocuments: client.expedientes.reduce((sum, exp) => sum + exp.documents.length, 0)
    }));
  }

  async getMyClientProfile(userId: string) {
    return this.prisma.client.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async findLawyers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.ABOGADO
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      if ((error as any).code === 'P2002') {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }
} 