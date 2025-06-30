import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdAt: string;
  isOwnMessage: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Client {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    expedientes: number;
    appointments: number;
  };
}

interface ConnectedUser {
  userId: string;
  name: string;
  role: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Inicializar WebSocket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:3000', {
      auth: {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
    });

    newSocket.on('connect', () => {
      console.log('Conectado al servidor de chat');
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor de chat');
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Actualizar conversación
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === message.senderId 
            ? { ...conv, lastMessage: message.content, lastMessageTime: message.createdAt }
            : conv
        )
      );

      // Mostrar notificación si no está en la conversación activa
      if (selectedConversation !== message.senderId) {
        showNotification(message.senderName, message.content);
      }
    });

    newSocket.on('message_sent', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_typing', (data: { userId: string; name: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    newSocket.on('user_connected', (user: ConnectedUser) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    newSocket.on('user_disconnected', (user: ConnectedUser) => {
      setConnectedUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    newSocket.on('message_error', (data: { error: string }) => {
      setError(data.error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [clientsRes, conversationsRes] = await Promise.all([
          api.get('/users/clients', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/chat/conversations', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setClients(clientsRes.data);
        setConversations(conversationsRes.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesWithUser(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessagesWithUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Error al cargar los mensajes');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    try {
      setSending(true);
      
      // Enviar mensaje a través de WebSocket
      socket.emit('send_message', {
        receiverId: selectedConversation,
        content: newMessage
      });

      setNewMessage('');
      
      // Detener indicador de escritura
      socket.emit('typing_stop', { receiverId: selectedConversation });
      setIsTyping(false);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = (userId: string) => {
    setSelectedClient(userId);
    setSelectedConversation(userId);
    setMessages([]);
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { receiverId: selectedConversation });
    }

    // Resetear el timeout de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { receiverId: selectedConversation });
    }, 1000);
  };

  const showNotification = (senderName: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Nuevo mensaje de ${senderName}`, {
        body: message,
        icon: '/favicon.ico',
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isUserOnline = (userId: string) => {
    return connectedUsers.some(user => user.userId === userId);
  };

  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">Chat con Clientes</h1>
            <p className="text-sm text-gray-600">Comunicación directa con tus clientes</p>
          </div>

          <div className="flex h-96">
            {/* Sidebar - Conversaciones */}
            <div className="w-1/3 border-r bg-gray-50">
              <div className="p-4 border-b">
                <h2 className="font-medium text-gray-900 mb-3">Conversaciones</h2>
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay conversaciones activas</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.userId}
                        onClick={() => handleSelectConversation(conversation.userId)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.userId
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {getAvatarInitial(conversation.userName)}
                              </span>
                            </div>
                            {isUserOnline(conversation.userId) && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.userName}
                              </p>
                              <div className="text-xs text-gray-400">
                                {formatTime(conversation.lastMessageTime)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {conversation.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nueva conversación */}
              <div className="p-4 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Nueva conversación</h3>
                <select
                  value={selectedClient}
                  onChange={(e) => handleStartNewConversation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Seleccionar cliente para nueva conversación"
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.user.id}>
                      {client.user.name} ({client.user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {getAvatarInitial(conversations.find(c => c.userId === selectedConversation)?.userName || 'C')}
                            </span>
                          </div>
                          {isUserOnline(selectedConversation) && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {conversations.find(c => c.userId === selectedConversation)?.userName || 'Cliente'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isUserOnline(selectedConversation) ? 'En línea' : 'Desconectado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p>No hay mensajes aún. ¡Inicia la conversación!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${
                              message.isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Indicador de escritura */}
                    {typingUsers.has(selectedConversation) && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="text-sm">Escribiendo...</div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">Selecciona una conversación</p>
                    <p className="text-sm">O inicia una nueva conversación con un cliente</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 