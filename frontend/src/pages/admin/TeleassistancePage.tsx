import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assistant: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface SessionStats {
  totalSessions: number;
  pendingSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageDuration: number;
}

const TeleassistancePage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TeleassistanceSession[]>([]);
  const [pendingSessions, setPendingSessions] = useState<TeleassistanceSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'stats'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar sesiones pendientes
      const pendingResponse = await axios.get('/api/teleassistance/sessions/pending');
      setPendingSessions(pendingResponse.data);

      // Cargar todas las sesiones del asistente
      const sessionsResponse = await axios.get('/api/teleassistance/sessions/assistant/' + user?.id);
      setSessions(sessionsResponse.data);

      // Cargar estadísticas (solo para admin)
      if (user?.role === 'ADMIN') {
        const statsResponse = await axios.get('/api/teleassistance/stats');
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading teleassistance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      await axios.post(`/api/teleassistance/sessions/${sessionId}/start`);
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async (sessionId: string, resolution?: string) => {
    try {
      await axios.post(`/api/teleassistance/sessions/${sessionId}/end`, { resolution });
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error ending session:', error);
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

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🖥️ Sistema de Teleasistencia
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona sesiones de asistencia remota para problemas de administración electrónica
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Sesiones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Duración Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.averageDuration)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sesiones Pendientes ({pendingSessions.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Sesiones ({sessions.length})
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Estadísticas
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sesiones Pendientes de Asistencia
                </h3>
                {pendingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No hay sesiones pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getIssueTypeIcon(session.issueType)}</div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {session.user.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {session.issueType.replace('_', ' ')} - {session.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                Creada: {formatDate(session.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(session.status)}
                            <button
                              onClick={() => startSession(session.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Iniciar Sesión
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Mis Sesiones de Teleasistencia
                </h3>
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No tienes sesiones de teleasistencia</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getIssueTypeIcon(session.issueType)}</div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {session.user.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {session.issueType.replace('_', ' ')} - {session.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                {session.startedAt && `Iniciada: ${formatDate(session.startedAt)}`}
                                {session.duration && ` | Duración: ${formatDuration(session.duration)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(session.status)}
                            {session.status === 'ACTIVE' && (
                              <button
                                onClick={() => endSession(session.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && stats && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estadísticas Detalladas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resumen General</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>Total de sesiones: {stats.totalSessions}</li>
                      <li>Sesiones pendientes: {stats.pendingSessions}</li>
                      <li>Sesiones activas: {stats.activeSessions}</li>
                      <li>Sesiones completadas: {stats.completedSessions}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Métricas de Tiempo</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>Duración promedio: {formatDuration(stats.averageDuration)}</li>
                      <li>Tasa de resolución: {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%</li>
                    </ul>
                  </div>
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