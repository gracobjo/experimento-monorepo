import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Appointment {
  id: string;
  date: string;
  location?: string;
  notes?: string;
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
}

interface Lawyer {
  id: string;
  name: string;
  email: string;
}

const AppointmentsPage = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    lawyerId: '',
    date: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLawyerFilter, setSelectedLawyerFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [lawyersRes, appointmentsRes] = await Promise.all([
          api.get('/users/lawyers'),
          api.get('/appointments')
        ]);
        setLawyers(lawyersRes.data);
        setAppointments(appointmentsRes.data);
        setError(null);
      } catch (err: any) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.lawyerId || !form.date) {
      setError('Selecciona abogado y fecha/hora');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/appointments', {
        lawyerId: form.lawyerId,
        date: form.date,
        location: form.location || undefined,
        notes: form.notes || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => [response.data, ...prev]);
      setForm({ lawyerId: '', date: '', location: '', notes: '' });
      setShowForm(false);
      setSuccess('Cita agendada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agendar la cita');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      setSuccess('Cita cancelada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Error al cancelar la cita');
    }
  };

  // Filtrar citas por abogado
  const filteredAppointments = useMemo(() => {
    if (selectedLawyerFilter === 'all') return appointments;
    return appointments.filter(app => app.lawyer.id === selectedLawyerFilter);
  }, [appointments, selectedLawyerFilter]);

  // Categorizar citas
  const categorizedAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      past: filteredAppointments.filter(app => new Date(app.date) < today),
      today: filteredAppointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= today && appDate < tomorrow;
      }),
      upcoming: filteredAppointments.filter(app => new Date(app.date) >= tomorrow),
    };
  }, [filteredAppointments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (dateString: string) => {
    const now = new Date();
    const appointmentDate = new Date(dateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (appointmentDate < today) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Pasada</span>;
    } else if (appointmentDate >= today && appointmentDate < tomorrow) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Hoy</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Próxima</span>;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{appointment.lawyer.name}</h3>
          <p className="text-sm text-gray-600">{appointment.lawyer.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(appointment.date)}
          <button
            onClick={() => handleCancelAppointment(appointment.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Cancelar cita"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(appointment.date)} a las {formatTime(appointment.date)}
        </div>
        
        {appointment.location && (
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {appointment.location}
          </div>
        )}
        
        {appointment.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <strong>Notas:</strong> {appointment.notes}
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendarView = () => {
    const today = new Date();
    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {nextDays.map((date, index) => {
          const dayAppointments = filteredAppointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate.toDateString() === date.toDateString();
          });

          return (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-500">
                  {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${
                  date.toDateString() === today.toDateString() ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayAppointments.map(appointment => (
                  <div key={appointment.id} className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-500">
                    <div className="font-medium">{appointment.lawyer.name}</div>
                    <div className="text-gray-600">{formatTime(appointment.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Citas</h1>
        <p className="text-gray-600">Gestiona tus citas con los abogados</p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showForm ? 'Cancelar' : 'Nueva Cita'}
            </button>
            
            <select
              value={selectedLawyerFilter}
              onChange={(e) => setSelectedLawyerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los abogados</option>
              {lawyers.map(lawyer => (
                <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'calendar' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Calendario
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
      </div>

      {/* Formulario de nueva cita */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Agendar Nueva Cita</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Abogado</label>
                <select
                  name="lawyerId"
                  value={form.lawyerId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un abogado</option>
                  {lawyers.map(lawyer => (
                    <option key={lawyer.id} value={lawyer.id}>{lawyer.name} ({lawyer.email})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y hora</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación (opcional)</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Oficina, online, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo / Notas (opcional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Motivo de la cita, detalles, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Agendar Cita
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vista de citas */}
      {viewMode === 'calendar' ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Vista de Calendario</h2>
          {renderCalendarView()}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Citas de hoy */}
          {categorizedAppointments.today.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-green-700">Citas de Hoy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedAppointments.today.map(renderAppointmentCard)}
              </div>
            </div>
          )}

          {/* Próximas citas */}
          {categorizedAppointments.upcoming.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Próximas Citas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedAppointments.upcoming.map(renderAppointmentCard)}
              </div>
            </div>
          )}

          {/* Citas pasadas */}
          {categorizedAppointments.past.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Citas Pasadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedAppointments.past.map(renderAppointmentCard)}
              </div>
            </div>
          )}

          {/* Sin citas */}
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedLawyerFilter === 'all' 
                  ? 'No tienes citas agendadas. Agenda una nueva cita para comenzar.'
                  : 'No tienes citas con este abogado.'
                }
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Agendar Nueva Cita
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage; 