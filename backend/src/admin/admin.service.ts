import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalLawyers,
      totalClients,
      totalCases,
      totalAppointments,
      totalTasks,
      totalDocuments,
      recentCases,
      recentAppointments,
      overdueTasks
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ABOGADO' } }),
      this.prisma.user.count({ where: { role: 'CLIENTE' } }),
      this.prisma.expediente.count(),
      this.prisma.appointment.count(),
      this.prisma.task.count(),
      this.prisma.document.count(),
      this.prisma.expediente.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { include: { user: true } },
          lawyer: true,
        },
      }),
      this.prisma.appointment.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          client: { include: { user: true } },
          lawyer: true,
        },
      }),
      this.prisma.task.findMany({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETADA' },
        },
        include: {
          assignedToUser: true,
          expediente: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalLawyers,
      totalClients,
      totalCases,
      totalAppointments,
      totalTasks,
      totalDocuments,
      recentCases,
      recentAppointments,
      overdueTasks,
    };
  }

  // User Management
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        client: true,
        expedientesAsLawyer: true,
        appointmentsAsLawyer: true,
        assignedTasks: true,
        createdTasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        client: true,
        expedientesAsLawyer: true,
        appointmentsAsLawyer: true,
        assignedTasks: true,
        createdTasks: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    const { client, ...userData } = data;
    
    if (client) {
      return this.prisma.user.update({
        where: { id },
        data: {
          ...userData,
          client: {
            upsert: {
              create: client,
              update: client,
            },
          },
        },
        include: {
          client: true,
        },
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: userData,
      include: {
        client: true,
      },
    });
  }

  async deleteUser(id: string) {
    try {
      // Check if user exists first, including client and lawyer relations
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          client: true,
          lawyer: true,
        },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Use a transaction to ensure all related records are deleted
      return await this.prisma.$transaction(async (tx) => {
        // Delete chat messages (these have cascade delete configured)
        await tx.chatMessage.deleteMany({
          where: {
            OR: [
              { senderId: id },
              { receiverId: id }
            ]
          }
        });

        // Delete tasks created by this user (these have cascade delete configured)
        await tx.task.deleteMany({
          where: { createdBy: id }
        });

        // Delete tasks assigned to this user
        await tx.task.updateMany({
          where: { assignedTo: id },
          data: { assignedTo: null }
        });

        // Delete documents uploaded by this user
        await tx.document.deleteMany({
          where: { uploadedBy: id }
        });

        // Delete appointments where user is lawyer
        await tx.appointment.deleteMany({
          where: { lawyerId: id }
        });

        // Delete expedientes where user is lawyer
        await tx.expediente.deleteMany({
          where: { lawyerId: id }
        });

        // Delete client profile if exists
        if (user.client) {
          // Delete appointments for this client
          await tx.appointment.deleteMany({
            where: { clientId: user.client.id }
          });

          // Delete tasks for this client
          await tx.task.deleteMany({
            where: { clientId: user.client.id }
          });

          // Delete expedientes for this client
          await tx.expediente.deleteMany({
            where: { clientId: user.client.id }
          });

          // Delete client profile
          await tx.client.delete({
            where: { userId: id }
          });
        }

        // Delete lawyer profile if exists
        if (user.lawyer) {
          await tx.lawyer.delete({
            where: { userId: id }
          });
        }

        // Finally delete the user
        return await tx.user.delete({
        where: { id }
        });
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // Handle specific Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2025') {
          throw new Error('Usuario no encontrado');
        } else if (error.code === 'P2003') {
          throw new Error('No se puede eliminar el usuario. Primero elimine todos los registros relacionados (expedientes, citas, documentos, etc.)');
        }
      }
      
      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al eliminar usuario: ${errorMessage}`);
    }
  }

  // Case Management
  async getAllCases() {
    return this.prisma.expediente.findMany({
      include: {
        client: { include: { user: true } },
        lawyer: true,
        documents: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCaseById(id: string) {
    return this.prisma.expediente.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        lawyer: true,
        documents: true,
        tasks: true,
      },
    });
  }

  async updateCase(id: string, data: any) {
    return this.prisma.expediente.update({
      where: { id },
      data,
      include: {
        client: { include: { user: true } },
        lawyer: true,
        documents: true,
        tasks: true,
      },
    });
  }

  async deleteCase(id: string) {
    return this.prisma.expediente.delete({
      where: { id },
    });
  }

  // Appointment Management
  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: {
        client: { include: { user: true } },
        lawyer: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async getAppointmentById(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        lawyer: true,
      },
    });
  }

  async updateAppointment(id: string, data: any) {
    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        client: { include: { user: true } },
        lawyer: true,
      },
    });
  }

  async deleteAppointment(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // Task Management
  async getAllTasks() {
    return this.prisma.task.findMany({
      include: {
        expediente: true,
        client: { include: { user: true } },
        assignedToUser: true,
        createdByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTaskById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        expediente: true,
        client: { include: { user: true } },
        assignedToUser: true,
        createdByUser: true,
      },
    });
  }

  async updateTask(id: string, data: any) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        expediente: true,
        client: { include: { user: true } },
        assignedToUser: true,
        createdByUser: true,
      },
    });
  }

  async deleteTask(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  // Document Management
  async getAllDocuments() {
    return this.prisma.document.findMany({
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        },
        uploadedByUser: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getDocumentById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        },
        uploadedByUser: true,
      },
    });
  }

  async deleteDocument(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }

  // Reports and Analytics
  async getSystemReports() {
    const [
      casesByStatus,
      tasksByStatus,
      appointmentsByMonth,
      userActivity,
      documentStats
    ] = await Promise.all([
      this.prisma.expediente.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.appointment.groupBy({
        by: ['date'],
        _count: { date: true },
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true,
          expedientesAsLawyer: {
            select: { id: true },
          },
          appointmentsAsLawyer: {
            select: { id: true },
          },
          assignedTasks: {
            select: { id: true },
          },
        },
      }),
      this.prisma.document.groupBy({
        by: ['mimeType'],
        _count: { mimeType: true },
        _sum: { fileSize: true },
      }),
    ]);

    return {
      casesByStatus,
      tasksByStatus,
      appointmentsByMonth,
      userActivity,
      documentStats,
    };
  }
} 