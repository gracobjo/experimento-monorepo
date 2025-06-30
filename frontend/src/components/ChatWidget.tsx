import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

interface ConnectedUser {
  userId: string;
  name: string;
  role: string;
}

interface AvailableUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Inicializar WebSocket
  useEffect(() => {
    if (!user || !isOpen) return;

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
      console.log('🔌 WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('📨 Received new message:', message);
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
      console.log('✅ Message sent confirmation:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_error', (data: { error: string }) => {
      console.error('❌ Message error:', data.error);
      setError(data.error);
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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesWithUser(selectedConversation);
      setUnreadCount(0);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      
      // Calcular total de mensajes no leídos
      const totalUnread = response.data.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      if (user?.role === 'CLIENTE') {
        endpoint = '/users/lawyers';
      } else if (user?.role === 'ABOGADO') {
        endpoint = '/users/clients';
      } else {
        return;
      }

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transformar los datos según el rol
      if (user?.role === 'ABOGADO') {
        // Para abogados, los clientes vienen con estructura anidada
        setAvailableUsers(response.data.map((client: any) => ({
          id: client.user.id,
          name: client.user.name,
          email: client.user.email,
          role: 'CLIENTE'
        })));
      } else {
        // Para clientes, los abogados vienen directamente
        setAvailableUsers(response.data.map((lawyer: any) => ({
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          role: 'ABOGADO'
        })));
      }
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };

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
    console.log('🚀 SEND MESSAGE TRIGGERED!', { newMessage, selectedConversation });
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    try {
      setSending(true);
      
      // Crear mensaje temporal para mostrar inmediatamente
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        senderId: user!.id,
        senderName: user!.name,
        receiverId: selectedConversation,
        receiverName: conversations.find(c => c.userId === selectedConversation)?.userName || 
                     availableUsers.find(u => u.id === selectedConversation)?.name || 'Usuario',
        createdAt: new Date().toISOString(),
        isOwnMessage: true
      };

      // Agregar mensaje temporal al estado local inmediatamente
      setMessages(prev => [...prev, tempMessage]);
      
      console.log('📤 Sending message via WebSocket', { 
        receiverId: selectedConversation, 
        content: newMessage,
        socketId: socket.id 
      });
      
      // Limpiar el input
      const messageToSend = newMessage;
      setNewMessage('');
      
      socket.emit('send_message', {
        receiverId: selectedConversation,
        content: messageToSend
      });

      socket.emit('typing_stop', { receiverId: selectedConversation });
      setIsTyping(false);
      
      // Hacer scroll al final
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      console.log('✅ Message sent successfully');
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      setError('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && !sending) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSendMessage(fakeEvent);
      }
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewConversation(false);
    fetchMessagesWithUser(userId);
  };

  const handleStartNewConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewConversation(false);
    setMessages([]);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { receiverId: selectedConversation });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { receiverId: selectedConversation });
    }, 1000);
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const testWebSocket = () => {
    if (socket) {
      console.log('🧪 Testing WebSocket connection...');
      socket.emit('test', { message: 'Test message' });
    } else {
      console.log('❌ No WebSocket connection available');
    }
  };

  // Solo mostrar el widget si el usuario está autenticado
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        aria-label="Abrir chat"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-20 right-4 bg-white rounded-lg shadow-xl border z-50 flex flex-col transition-all duration-300 ${
          isMinimized ? 'w-80 h-96' : 'w-[450px] h-[600px]'
        }`}>
          {/* Header */}
          <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Chat</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    console.log('🧪 Testing WebSocket:', { socket: !!socket, socketId: socket?.id });
                    if (socket) {
                      socket.emit('test', { message: 'Test from widget' });
                    }
                  }}
                  className="text-white hover:text-gray-200 text-xs px-2 py-1 bg-blue-700 rounded"
                  title="Test WebSocket"
                >
                  Test
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:text-gray-200"
                  aria-label={isMinimized ? "Maximizar" : "Minimizar"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMinimized ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white hover:text-gray-200"
                  aria-label="Cerrar chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {!selectedConversation ? (
              // Conversation List
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Conversaciones</h4>
                  <button
                    onClick={() => setShowNewConversation(!showNewConversation)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {showNewConversation ? 'Cancelar' : 'Nueva'}
                  </button>
                </div>
                
                {showNewConversation ? (
                  // New Conversation Selector
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      {user?.role === 'CLIENTE' ? 'Seleccionar Abogado' : 'Seleccionar Cliente'}
                    </h5>
                    {availableUsers.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">Cargando usuarios...</div>
                    ) : (
                      availableUsers.map((availableUser) => (
                        <div
                          key={availableUser.id}
                          onClick={() => handleStartNewConversation(availableUser.id)}
                          className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {getAvatarInitial(availableUser.name)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {availableUser.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {availableUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Existing Conversations
                  <>
                    {loading ? (
                      <div className="text-center text-gray-500">Cargando...</div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center text-gray-500">No hay conversaciones</div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.userId}
                            onClick={() => handleSelectConversation(conversation.userId)}
                            className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {getAvatarInitial(conversation.userName)}
                                  </span>
                                </div>
                                {isUserOnline(conversation.userId) && (
                                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
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
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
                  </>
                )}
              </div>
            ) : (
              // Chat Area
              <>
                {/* Chat Header */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => setSelectedConversation('')}
                        className="mr-2 text-gray-500 hover:text-gray-700"
                        aria-label="Volver a conversaciones"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="relative">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getAvatarInitial(
                              conversations.find(c => c.userId === selectedConversation)?.userName ||
                              availableUsers.find(u => u.id === selectedConversation)?.name || 'U'
                            )}
                          </span>
                        </div>
                        {isUserOnline(selectedConversation) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          {conversations.find(c => c.userId === selectedConversation)?.userName || 
                           availableUsers.find(u => u.id === selectedConversation)?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isUserOnline(selectedConversation) ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px]">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm">
                      No hay mensajes aún
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[280px] px-3 py-2 rounded-lg text-sm break-words ${
                            message.isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div>{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {typingUsers.has(selectedConversation) && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm">
                        Escribiendo...
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t">
                  <div className="flex space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[100px] resize-none"
                      disabled={sending}
                      rows={1}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] min-w-[40px]"
                    >
                      {sending ? '...' : '→'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-t border-red-200">
              <div className="text-red-600 text-xs">{error}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget; 