import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

interface TeleassistanceSession {
  id: string;
  userId: string;
  assistantId: string;
  issueType: string;
  description: string;
  remoteTool?: string;
  status: string;
  sessionCode: string;
  resolution?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  assistant: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  messages: TeleassistanceMessage[];
}

interface TeleassistanceMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const TeleassistancePage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TeleassistanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TeleassistanceSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teleassistance/sessions/user/' + user?.id);
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/teleassistance/sessions/${sessionId}`);
      setSelectedSession(response.data);
    } catch (error) {
      console.error('Error loading session details:', error);
    }
  };

  const sendMessage = async (sessionId: string) => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await axios.post(`/api/teleassistance/sessions/${sessionId}/messages`, {
        content: newMessage,
        messageType: 'TEXT'
      });
      setNewMessage('');
      await loadSessionDetails(sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      ACTIVE: { color: 'bg-green-100 text-green-800', text: 'Activa' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', text: 'Completada' },
      CANCELLED: { color: 'bg-red-100 text-red-800', text: 'Cancelada' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getIssueTypeIcon = (issueType: string) => {
    const icons = {
      AUTOFIRMA: '🔐',
      CERTIFICADO_DIGITAL: '🆔',
      SEDES: '🏛️',
      CLAVE_PIN: '📱',
      NAVEGADOR: '🌐',
      SISTEMA_OPERATIVO: '💻',
      OTRO: '❓',
    };
    return icons[issueType as keyof typeof icons] || '❓';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🖥️ Mis Sesiones de Teleasistencia
              </h1>
              <p className="text-lg text-gray-600">
                Gestiona tus solicitudes de asistencia remota
              </p>
            </div>
            <Link
              to="/client/teleassistance/request"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Nueva Solicitud
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Sesiones */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Mis Sesiones ({sessions.length})
              </h2>
              
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No tienes sesiones de teleasistencia</p>
                  <Link
                    to="/client/teleassistance/request"
                    className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Solicitar Asistencia
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSessionDetails(session.id)}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedSession?.id === session.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getIssueTypeIcon(session.issueType)}</span>
                          <span className="font-medium text-gray-900">
                            {session.issueType.replace('_', ' ')}
                          </span>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {session.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Asistente: {session.assistant.name}</span>
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detalles de la Sesión */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-md">
                {/* Header de la Sesión */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getIssueTypeIcon(selectedSession.issueType)}</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedSession.issueType.replace('_', ' ')}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Asistente: {selectedSession.assistant.name}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(selectedSession.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Descripción:</span>
                      <p className="text-gray-600">{selectedSession.description}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Código de Sesión:</span>
                      <p className="text-gray-600 font-mono">{selectedSession.sessionCode}</p>
                    </div>
                    {selectedSession.startedAt && (
                      <div>
                        <span className="font-medium text-gray-700">Iniciada:</span>
                        <p className="text-gray-600">{formatDate(selectedSession.startedAt)}</p>
                      </div>
                    )}
                    {selectedSession.duration && (
                      <div>
                        <span className="font-medium text-gray-700">Duración:</span>
                        <p className="text-gray-600">{formatDuration(selectedSession.duration)}</p>
                      </div>
                    )}
                  </div>

                  {selectedSession.resolution && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Resolución:</h4>
                      <p className="text-green-800">{selectedSession.resolution}</p>
                    </div>
                  )}
                </div>

                {/* Chat de Mensajes */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Mensajes</h3>
                  
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {selectedSession.messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No hay mensajes en esta sesión
                      </p>
                    ) : (
                      selectedSession.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender.id === user?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-xs opacity-75 mb-1">
                              {message.sender.name} - {formatDate(message.createdAt)}
                            </div>
                            <p>{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Envío de Mensajes */}
                  {selectedSession.status === 'ACTIVE' && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedSession.id)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => sendMessage(selectedSession.id)}
                        disabled={sendingMessage || !newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {sendingMessage ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona una sesión para ver los detalles
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeleassistancePage; 