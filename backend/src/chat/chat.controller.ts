import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('test')
  @ApiOperation({ 
    summary: 'Probar conexión del chat',
    description: 'Endpoint de prueba para verificar que el chat funciona'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Chat controller is working' }
      }
    }
  })
  async test() {
    return { message: 'Chat controller is working' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener mensajes del usuario',
    description: 'Devuelve todos los mensajes del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de mensajes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          senderId: { type: 'string' },
          receiverId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          sender: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          receiver: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMessages(@Request() req) {
    return this.chatService.getMessages(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Enviar mensaje',
    description: 'Envía un nuevo mensaje a otro usuario'
  })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Mensaje enviado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        senderId: { type: 'string' },
        receiverId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario receptor no encontrado' })
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.sendMessage(createMessageDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener conversaciones',
    description: 'Devuelve las conversaciones del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de conversaciones',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          userName: { type: 'string' },
          userEmail: { type: 'string' },
          lastMessage: { type: 'string' },
          lastMessageTime: { type: 'string', format: 'date-time' },
          unreadCount: { type: 'number' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:userId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener mensajes con usuario específico',
    description: 'Devuelve la conversación con un usuario específico'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario con quien conversar', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversación con el usuario',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          senderId: { type: 'string' },
          receiverId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          sender: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          receiver: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getMessagesWithUser(@Param('userId') userId: string, @Request() req) {
    return this.chatService.getMessagesWithUser(req.user, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener conteo de mensajes no leídos',
    description: 'Devuelve el número total de mensajes no leídos del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conteo de mensajes no leídos',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUnreadCount(@Request() req) {
    return this.chatService.getTotalUnreadCount(req.user);
  }
} 