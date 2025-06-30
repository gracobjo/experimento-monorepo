import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  type: 'appointment' | 'message';
  count: number;
  title: string;
  description: string;
  link: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Obtener citas pendientes
        const appointmentsResponse = await api.get('/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener mensajes no leídos (si existe el endpoint)
        let unreadMessages = 0;
        try {
          const messagesResponse = await api.get('/chat/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          });
          unreadMessages = messagesResponse.data.count || 0;
        } catch (error) {
          // Si no existe el endpoint, no mostrar notificación de mensajes
        }

        const newNotifications: Notification[] = [];

        // Filtrar citas de hoy y próximas
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const upcomingAppointments = appointmentsResponse.data.filter((app: any) => {
          const appDate = new Date(app.date);
          return appDate >= today;
        });

        if (upcomingAppointments.length > 0) {
          const todayAppointments = upcomingAppointments.filter((app: any) => {
            const appDate = new Date(app.date);
            return appDate >= today && appDate < tomorrow;
          });

          if (todayAppointments.length > 0) {
            newNotifications.push({
              id: 'appointments-today',
              type: 'appointment',
              count: todayAppointments.length,
              title: 'Citas de Hoy',
              description: `Tienes ${todayAppointments.length} cita${todayAppointments.length > 1 ? 's' : ''} programada${todayAppointments.length > 1 ? 's' : ''} para hoy`,
              link: user.role === 'CLIENTE' ? '/client/appointments' : '/lawyer/appointments'
            });
          } else {
            newNotifications.push({
              id: 'appointments-upcoming',
              type: 'appointment',
              count: upcomingAppointments.length,
              title: 'Próximas Citas',
              description: `Tienes ${upcomingAppointments.length} cita${upcomingAppointments.length > 1 ? 's' : ''} programada${upcomingAppointments.length > 1 ? 's' : ''}`,
              link: user.role === 'CLIENTE' ? '/client/appointments' : '/lawyer/appointments'
            });
          }
        }

        // Agregar notificación de mensajes si hay mensajes no leídos
        if (unreadMessages > 0) {
          newNotifications.push({
            id: 'unread-messages',
            type: 'message',
            count: unreadMessages,
            title: 'Mensajes Nuevos',
            description: `Tienes ${unreadMessages} mensaje${unreadMessages > 1 ? 's' : ''} sin leer`,
            link: user.role === 'CLIENTE' ? '/client/chat' : '/lawyer/chat'
          });
        }

        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Ocultar notificación cuando el usuario visita la página correspondiente
  useEffect(() => {
    const newDismissed = new Set(dismissed);
    
    notifications.forEach(notification => {
      if (location.pathname === notification.link) {
        newDismissed.add(notification.id);
      }
    });
    
    if (newDismissed.size !== dismissed.size) {
      setDismissed(newDismissed);
    }
  }, [location.pathname, notifications, dismissed]);

  const handleDismiss = (notificationId: string) => {
    setDismissed(prev => new Set([...prev, notificationId]));
  };

  const visibleNotifications = notifications.filter(notification => 
    !dismissed.has(notification.id)
  );

  if (loading || visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ${
            notification.type === 'appointment' 
              ? 'border-blue-500' 
              : 'border-green-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  notification.type === 'appointment'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {notification.count}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {notification.description}
              </p>
              <div className="flex space-x-2">
                <a
                  href={notification.link}
                  className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                    notification.type === 'appointment'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Ver {notification.type === 'appointment' ? 'Citas' : 'Mensajes'}
                </a>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100"
                >
                  Ocultar
                </button>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications; 