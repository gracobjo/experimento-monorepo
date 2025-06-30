import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuración para Gmail (puedes cambiar por tu proveedor de email)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'tu-password-de-aplicacion',
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: email,
      subject: 'Recuperación de Contraseña - Sistema Legal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Recuperación de Contraseña</h2>
          <p>Hola ${userName},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Sistema Legal - Soporte técnico
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendContactNotification(contactData: {
    nombre: string;
    email: string;
    telefono?: string;
    asunto: string;
    mensaje: string;
  }) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@despachoabogados.com';
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: adminEmail,
      subject: `Nueva Consulta: ${contactData.asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Nueva Consulta Recibida</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${contactData.nombre}</p>
            <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
            ${contactData.telefono ? `<p><strong>Teléfono:</strong> <a href="tel:${contactData.telefono}">${contactData.telefono}</a></p>` : ''}
            <p><strong>Asunto:</strong> ${contactData.asunto}</p>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Mensaje</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.mensaje}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${contactData.email}?subject=Re: ${contactData.asunto}" 
               style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Responder al Cliente
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Sistema Legal - Notificación automática
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending contact notification email:', error);
      return false;
    }
  }

  async sendContactConfirmation(contactData: {
    nombre: string;
    email: string;
  }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: contactData.email,
      subject: 'Confirmación de Consulta - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Gracias por tu Consulta!</h2>
          <p>Hola ${contactData.nombre},</p>
          <p>Hemos recibido tu consulta correctamente. Nuestro equipo de abogados especialistas la revisará y se pondrá en contacto contigo en las próximas 24 horas.</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">¿Qué puedes esperar?</h3>
            <ul style="color: #2c3e50;">
              <li>Respuesta personalizada de un abogado especialista</li>
              <li>Evaluación inicial de tu caso</li>
              <li>Orientación sobre los próximos pasos</li>
              <li>Información sobre honorarios si aplica</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending contact confirmation email:', error);
      return false;
    }
  }

  async sendAppointmentRescheduledEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    originalDate: Date;
    originalLocation?: string;
    newDate: Date;
    newLocation?: string;
    notes?: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Cita Reprogramada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Cita Reprogramada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu abogado <strong>${data.lawyerName}</strong> ha reprogramado tu cita. Te informamos de los cambios:</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Cambios Realizados</h3>
            <div style="margin-bottom: 15px;">
              <p><strong>Fecha y hora anterior:</strong></p>
              <p style="color: #856404; margin: 5px 0;">${formatDate(data.originalDate)}</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p><strong>Nueva fecha y hora:</strong></p>
              <p style="color: #155724; font-weight: bold; margin: 5px 0;">${formatDate(data.newDate)}</p>
            </div>
            ${data.originalLocation && data.newLocation && data.originalLocation !== data.newLocation ? `
            <div style="margin-bottom: 15px;">
              <p><strong>Ubicación anterior:</strong> ${data.originalLocation}</p>
              <p><strong>Nueva ubicación:</strong> ${data.newLocation}</p>
            </div>
            ` : ''}
            ${data.notes ? `
            <div style="margin-bottom: 15px;">
              <p><strong>Notas del abogado:</strong></p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin: 5px 0;">${data.notes}</p>
            </div>
            ` : ''}
          </div>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">¿Qué debes hacer?</h3>
            <ul style="color: #155724;">
              <li>Actualiza tu agenda con la nueva fecha y hora</li>
              <li>Confirma tu asistencia a la nueva cita</li>
              <li>Si no puedes asistir, contacta con tu abogado lo antes posible</li>
              <li>Llega 10 minutos antes de la hora programada</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/appointments" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Mis Citas
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment rescheduled email:', error);
      return false;
    }
  }
} 