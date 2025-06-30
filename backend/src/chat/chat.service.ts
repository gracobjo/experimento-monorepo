import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(user: any) {
    const userId = user.id;
    const userRole = user.role;

    try {
      let messages;

      if (userRole === 'CLIENTE') {
        // Para clientes, obtener mensajes donde son remitente o destinatario
        messages = await this.prisma.chatMessage.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
      } else if (userRole === 'ABOGADO') {
        // Para abogados, obtener mensajes donde son remitente o destinatario
        messages = await this.prisma.chatMessage.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
      } else {
        throw new ForbiddenException('Rol no autorizado para acceder al chat');
      }

      // Transformar los mensajes para el frontend
      return messages.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        receiverId: message.receiverId,
        receiverName: message.receiver.name,
        createdAt: message.createdAt,
        isOwnMessage: message.senderId === userId
      }));

    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('Error al obtener los mensajes');
    }
  }

  async sendMessage(dto: CreateMessageDto, user: any) {
    const senderId = user.id;
    const { receiverId, content } = dto;

    if (!content || !content.trim()) {
      throw new Error('El contenido del mensaje no puede estar vacío');
    }

    if (!receiverId) {
      throw new Error('El destinatario es requerido');
    }

    try {
      // Verificar que el destinatario existe
      const receiver = await this.prisma.user.findUnique({
        where: { id: receiverId }
      });

      if (!receiver) {
        throw new NotFoundException('Destinatario no encontrado');
      }

      // Verificar que el usuario puede enviar mensajes al destinatario
      if (user.role === 'CLIENTE') {
        // Clientes solo pueden enviar mensajes a abogados
        if (receiver.role !== 'ABOGADO') {
          throw new ForbiddenException('Los clientes solo pueden enviar mensajes a abogados');
        }
      } else if (user.role === 'ABOGADO') {
        // Abogados pueden enviar mensajes a clientes
        if (receiver.role !== 'CLIENTE') {
          throw new ForbiddenException('Los abogados solo pueden enviar mensajes a clientes');
        }
      } else {
        throw new ForbiddenException('Rol no autorizado para enviar mensajes');
      }

      // Crear el mensaje
      const message = await this.prisma.chatMessage.create({
        data: {
          content: content.trim(),
          senderId,
          receiverId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // Retornar el mensaje transformado
      return {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        receiverId: message.receiverId,
        receiverName: message.receiver.name,
        createdAt: message.createdAt,
        isOwnMessage: true
      };

    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error al enviar el mensaje');
    }
  }

  async getConversations(user: any) {
    const userId = user.id;
    const userRole = user.role;

    try {
      let conversations;

      if (userRole === 'CLIENTE') {
        // Para clientes, obtener conversaciones con abogados
        const messages = await this.prisma.chatMessage.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Agrupar por conversación (otro usuario)
        const conversationMap = new Map();
        messages.forEach(message => {
          const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
          const otherUser = message.senderId === userId ? message.receiver : message.sender;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              userName: otherUser.name,
              userEmail: otherUser.email,
              userRole: otherUser.role,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: 0 // TODO: Implementar contador de no leídos
            });
          }
        });

        conversations = Array.from(conversationMap.values());

      } else if (userRole === 'ABOGADO') {
        // Para abogados, obtener conversaciones con clientes
        const messages = await this.prisma.chatMessage.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Agrupar por conversación (otro usuario)
        const conversationMap = new Map();
        messages.forEach(message => {
          const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
          const otherUser = message.senderId === userId ? message.receiver : message.sender;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              userName: otherUser.name,
              userEmail: otherUser.email,
              userRole: otherUser.role,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: 0 // TODO: Implementar contador de no leídos
            });
          }
        });

        conversations = Array.from(conversationMap.values());
      } else {
        throw new ForbiddenException('Rol no autorizado para acceder al chat');
      }

      return conversations;

    } catch (error) {
      console.error('Error getting conversations:', error);
      throw new Error('Error al obtener las conversaciones');
    }
  }

  async getMessagesWithUser(user: any, otherUserId: string) {
    const userId = user.id;
    const userRole = user.role;

    try {
      // Verificar que el otro usuario existe
      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId }
      });

      if (!otherUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar permisos según el rol
      if (userRole === 'CLIENTE' && otherUser.role !== 'ABOGADO') {
        throw new ForbiddenException('Los clientes solo pueden chatear con abogados');
      }
      if (userRole === 'ABOGADO' && otherUser.role !== 'CLIENTE') {
        throw new ForbiddenException('Los abogados solo pueden chatear con clientes');
      }

      // Obtener mensajes entre los dos usuarios
      const messages = await this.prisma.chatMessage.findMany({
        where: {
          OR: [
            {
              AND: [
                { senderId: userId },
                { receiverId: otherUserId }
              ]
            },
            {
              AND: [
                { senderId: otherUserId },
                { receiverId: userId }
              ]
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Transformar los mensajes
      return messages.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        receiverId: message.receiverId,
        receiverName: message.receiver.name,
        createdAt: message.createdAt,
        isOwnMessage: message.senderId === userId
      }));

    } catch (error) {
      console.error('Error getting messages with user:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error al obtener los mensajes');
    }
  }

  async markMessagesAsRead(userId: string, senderId: string) {
    try {
      // Marcar mensajes como leídos
      // Por ahora, solo retornamos éxito ya que no tenemos un campo de "leído" en el modelo
      // En una implementación futura, podrías agregar un campo `read` al modelo ChatMessage
      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Error al marcar mensajes como leídos');
    }
  }

  async getUnreadCount(userId: string, senderId: string) {
    try {
      // Contar mensajes no leídos
      // Por ahora, retornamos 0 ya que no tenemos un campo de "leído" en el modelo
      const count = await this.prisma.chatMessage.count({
        where: {
          senderId: senderId,
          receiverId: userId,
          // read: false // Campo que se agregaría en el futuro
        }
      });
      
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async getTotalUnreadCount(user: any) {
    try {
      const userId = user.id;
      
      // Por ahora, como no tenemos un campo de "leído" en el modelo,
      // contamos todos los mensajes recibidos por el usuario
      // En una implementación futura, esto sería: where: { receiverId: userId, read: false }
      const count = await this.prisma.chatMessage.count({
        where: {
          receiverId: userId,
          // read: false // Campo que se agregaría en el futuro
        }
      });
      
      return { count };
    } catch (error) {
      console.error('Error getting total unread count:', error);
      return { count: 0 };
    }
  }
} 