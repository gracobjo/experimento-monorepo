import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getLawyerReports(lawyerId: string) {
    // Estadísticas de tareas
    const tasksStats = await this.prisma.task.groupBy({
      by: ['status'],
      where: {
        OR: [
          { assignedTo: lawyerId },
          { createdBy: lawyerId }
        ]
      },
      _count: {
        status: true
      }
    });

    // Estadísticas de casos
    const casesStats = await this.prisma.expediente.groupBy({
      by: ['status'],
      where: {
        lawyerId: lawyerId
      },
      _count: {
        status: true
      }
    });

    // Próximas citas (próximos 7 días)
    const upcomingAppointments = await this.prisma.appointment.count({
      where: {
        lawyerId: lawyerId,
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        }
      }
    });

    // Tareas vencidas
    const overdueTasks = await this.prisma.task.count({
      where: {
        OR: [
          { assignedTo: lawyerId },
          { createdBy: lawyerId }
        ],
        dueDate: {
          lt: new Date()
        },
        status: {
          not: 'COMPLETADA'
        }
      }
    });

    // Total de tareas
    const totalTasks = await this.prisma.task.count({
      where: {
        OR: [
          { assignedTo: lawyerId },
          { createdBy: lawyerId }
        ]
      }
    });

    // Total de casos
    const totalCases = await this.prisma.expediente.count({
      where: {
        lawyerId: lawyerId
      }
    });

    // Convertir estadísticas a formato más útil
    const tasksByStatus = {
      PENDIENTE: 0,
      EN_PROGRESO: 0,
      COMPLETADA: 0,
      CANCELADA: 0
    };

    tasksStats.forEach(stat => {
      tasksByStatus[stat.status] = stat._count.status;
    });

    const casesByStatus = {
      ABIERTO: 0,
      EN_PROCESO: 0,
      CERRADO: 0
    };

    casesStats.forEach(stat => {
      casesByStatus[stat.status] = stat._count.status;
    });

    return {
      tasks: {
        total: totalTasks,
        byStatus: tasksByStatus,
        overdue: overdueTasks
      },
      cases: {
        total: totalCases,
        byStatus: casesByStatus
      },
      appointments: {
        upcoming: upcomingAppointments
      }
    };
  }
} 