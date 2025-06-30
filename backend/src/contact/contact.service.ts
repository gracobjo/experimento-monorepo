import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async submitContactForm(createContactDto: CreateContactDto) {
    try {
      // Guardar en la base de datos
      const contact = await this.prisma.contact.create({
        data: {
          nombre: createContactDto.nombre,
          email: createContactDto.email,
          telefono: createContactDto.telefono,
          asunto: createContactDto.asunto,
          mensaje: createContactDto.mensaje,
          ip: createContactDto.ip || 'unknown',
          userAgent: createContactDto.userAgent || 'unknown'
        }
      });

      // Enviar email de notificación al administrador
      await this.emailService.sendContactNotification({
        nombre: createContactDto.nombre,
        email: createContactDto.email,
        telefono: createContactDto.telefono,
        asunto: createContactDto.asunto,
        mensaje: createContactDto.mensaje
      });

      // Enviar email de confirmación al usuario
      await this.emailService.sendContactConfirmation({
        nombre: createContactDto.nombre,
        email: createContactDto.email
      });

      return contact;
    } catch (error) {
      console.error('Error en submitContactForm:', error);
      throw error;
    }
  }

  async getContactStats() {
    const total = await this.prisma.contact.count();
    const today = await this.prisma.contact.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const thisWeek = await this.prisma.contact.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    return {
      total,
      today,
      thisWeek
    };
  }
} 