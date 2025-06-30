import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async findAll(user: any) {
    if (user.role === 'ADMIN') {
      // Admin ve todas las citas
      return this.prisma.appointment.findMany({
        include: {
          lawyer: { select: { id: true, name: true, email: true } },
          client: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    } else if (user.role === 'ABOGADO') {
      // Abogado ve solo sus citas
      return this.prisma.appointment.findMany({
        where: { lawyerId: user.id },
        include: {
          lawyer: { select: { id: true, name: true, email: true } },
          client: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    } else {
      // Cliente ve solo sus citas
      const client = await this.prisma.client.findUnique({
        where: { userId: user.id }
      });
      if (!client) throw new ForbiddenException('No eres cliente');
      return this.prisma.appointment.findMany({
        where: { clientId: client.id },
        include: {
          lawyer: { select: { id: true, name: true, email: true } },
          client: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    }
  }

  async create(dto: CreateAppointmentDto, user: any) {
    // Solo clientes pueden crear citas
    if (user.role !== 'CLIENTE') throw new ForbiddenException('Solo los clientes pueden agendar citas');
    const client = await this.prisma.client.findUnique({ where: { userId: user.id } });
    if (!client) throw new ForbiddenException('No eres cliente');
    // Verificar que el abogado existe
    const lawyer = await this.prisma.user.findUnique({ where: { id: dto.lawyerId, role: 'ABOGADO' } });
    if (!lawyer) throw new NotFoundException('Abogado no encontrado');
    // Crear cita
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: client.id,
        lawyerId: dto.lawyerId,
        date: new Date(dto.date),
        location: dto.location || null,
        notes: dto.notes || null,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
    return appointment;
  }

  async delete(id: string, user: any) {
    // Buscar la cita
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        lawyer: true
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos
    if (user.role === 'CLIENTE') {
      // Cliente solo puede cancelar sus propias citas
      const client = await this.prisma.client.findUnique({ where: { userId: user.id } });
      if (!client || appointment.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para cancelar esta cita');
      }
    } else if (user.role === 'ABOGADO') {
      // Abogado solo puede cancelar sus propias citas
      if (appointment.lawyerId !== user.id) {
        throw new ForbiddenException('No tienes permisos para cancelar esta cita');
      }
    } else if (user.role !== 'ADMIN') {
      // Solo admin puede cancelar cualquier cita
      throw new ForbiddenException('No tienes permisos para cancelar citas');
    }

    // Eliminar la cita
    await this.prisma.appointment.delete({
      where: { id }
    });

    return { message: 'Cita cancelada exitosamente' };
  }

  async reschedule(id: string, rescheduleData: { date: string; location?: string; notes?: string }, user: any) {
    // Buscar la cita
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { 
          include: { 
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            } 
          } 
        },
        lawyer: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos - solo abogados pueden reprogramar citas
    if (user.role !== 'ABOGADO') {
      throw new ForbiddenException('Solo los abogados pueden reprogramar citas');
    }

    // Verificar que el abogado es el asignado a la cita
    if (appointment.lawyerId !== user.id) {
      throw new ForbiddenException('No tienes permisos para reprogramar esta cita');
    }

    // Guardar la fecha y hora originales para el email
    const originalDate = appointment.date;
    const originalLocation = appointment.location;

    // Actualizar la cita
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        date: new Date(rescheduleData.date),
        location: rescheduleData.location || appointment.location,
        notes: rescheduleData.notes || appointment.notes,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Enviar email de notificación al cliente
    try {
      await this.emailService.sendAppointmentRescheduledEmail({
        clientName: appointment.client.user.name,
        clientEmail: appointment.client.user.email,
        lawyerName: appointment.lawyer.name,
        originalDate: originalDate,
        originalLocation: originalLocation,
        newDate: new Date(rescheduleData.date),
        newLocation: rescheduleData.location || appointment.location,
        notes: rescheduleData.notes
      });
    } catch (error) {
      console.error('Error sending reschedule notification email:', error);
      // No lanzar error si falla el email, solo log
    }

    return updatedAppointment;
  }
} 