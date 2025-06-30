import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface ConnectedUser {
  userId: string;
  socketId: string;
  role: string;
  name: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const userInfo = client.handshake.auth.user;
      
      if (!userInfo) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(client.id, {
        userId: userInfo.id,
        socketId: client.id,
        role: userInfo.role,
        name: userInfo.name,
      });

      client.join(`user_${userInfo.id}`);

      this.server.emit('user_connected', {
        userId: userInfo.id,
        name: userInfo.name,
        role: userInfo.role,
      });

      console.log(`Usuario conectado: ${userInfo.name} (${userInfo.id})`);
    } catch (error) {
      console.error('Error en conexión WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.connectedUsers.delete(client.id);
      
      this.server.emit('user_disconnected', {
        userId: user.userId,
        name: user.name,
        role: user.role,
      });

      console.log(`Usuario desconectado: ${user.name} (${user.userId})`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sender = this.connectedUsers.get(client.id);
      if (!sender) {
        return { error: 'Usuario no autenticado' };
      }

      const message = await this.chatService.sendMessage(
        { receiverId: data.receiverId, content: data.content },
        { id: sender.userId, role: sender.role }
      );

      this.server.to(`user_${data.receiverId}`).emit('new_message', {
        ...message,
        isOwnMessage: false,
      });

      client.emit('message_sent', {
        ...message,
        isOwnMessage: true,
      });

      return { success: true, message };
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      client.emit('message_error', { error: error.message || 'Error desconocido' });
      return { error: error.message || 'Error desconocido' };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = this.connectedUsers.get(client.id);
    if (sender) {
      this.server.to(`user_${data.receiverId}`).emit('user_typing', {
        userId: sender.userId,
        name: sender.name,
        isTyping: true,
      });
    }
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = this.connectedUsers.get(client.id);
    if (sender) {
      this.server.to(`user_${data.receiverId}`).emit('user_typing', {
        userId: sender.userId,
        name: sender.name,
        isTyping: false,
      });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      await this.chatService.markMessagesAsRead(user.userId, data.senderId);

      this.server.to(`user_${data.senderId}`).emit('messages_read', {
        readerId: user.userId,
        readerName: user.name,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error marcando mensajes como leídos:', error);
      return { error: error.message || 'Error desconocido' };
    }
  }

  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).some(user => user.userId === userId);
  }
} 