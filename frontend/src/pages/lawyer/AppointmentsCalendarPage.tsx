import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer, type Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  client: { user: { name: string; email: string } };
  lawyer: { name: string; email: string };
  date: string;
  location: string;
  notes?: string;
}

interface RescheduleForm {
  date: string;
  location: string;
  notes: string;
}

const AppointmentsCalendarPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({
    date: '',
    location: '',
    notes: ''
  });
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
        setError(null);
      } catch (err: any) {
        setError('Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Estadísticas
  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(a => moment(a.date).isAfter(moment())).length;
    const past = appointments.filter(a => moment(a.date).isBefore(moment())).length;
    return { total, upcoming, past };
  }, [appointments]);

  // Map appointments to calendar events
  const events: CalendarEvent[] = appointments.map(a => ({
    id: a.id,
    title: `${a.client.user.name} - ${moment(a.date).format('HH:mm')}`,
    start: new Date(a.date),
    end: moment(a.date).add(1, 'hour').toDate(),
    resource: a,
  }));

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelected(appointment);
    setRescheduleForm({
      date: moment(appointment.date).format('YYYY-MM-DDTHH:mm'),
      location: appointment.location || '',
      notes: ''
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    try {
      setRescheduling(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/appointments/${selected.id}/reschedule`, rescheduleForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar la lista de citas
      setAppointments(prev => prev.map(app => 
        app.id === selected.id ? response.data : app
      ));

      setSuccess('Cita reprogramada exitosamente. Se ha enviado una notificación al cliente.');
      setShowRescheduleModal(false);
      setSelected(null);
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reprogramar la cita');
    } finally {
      setRescheduling(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRescheduleForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Calendario de Citas</h1>
        
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-gray-500 text-sm">Total Citas</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-gray-500 text-sm">Próximas</div>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-gray-500 text-sm">Pasadas</div>
            <div className="text-2xl font-bold">{stats.past}</div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded shadow p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={event => setSelected(event.resource)}
            messages={{
              next: 'Sig',
              previous: 'Ant',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
            }}
          />
        </div>

        {/* Modal Detalle de Cita */}
        {selected && !showRescheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelected(null)}>×</button>
              <h2 className="text-xl font-bold mb-4">Detalle de la Cita</h2>
              <div className="mb-2"><b>Cliente:</b> {selected.client.user.name} ({selected.client.user.email})</div>
              <div className="mb-2"><b>Abogado:</b> {selected.lawyer.name} ({selected.lawyer.email})</div>
              <div className="mb-2"><b>Fecha y hora:</b> {moment(selected.date).format('DD/MM/YYYY HH:mm')}</div>
              <div className="mb-2"><b>Lugar:</b> {selected.location}</div>
              {selected.notes && <div className="mb-2"><b>Notas:</b> {selected.notes}</div>}
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  onClick={() => handleRescheduleClick(selected)}
                >
                  Reprogramar
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => setSelected(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Reprogramación */}
        {showRescheduleModal && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button 
                className="absolute top-2 right-2 text-gray-500" 
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelected(null);
                }}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Reprogramar Cita</h2>
              <p className="text-sm text-gray-600 mb-4">
                Cliente: <strong>{selected.client.user.name}</strong>
              </p>
              
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={rescheduleForm.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={rescheduleForm.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Oficina, online, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    name="notes"
                    value={rescheduleForm.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Motivo del cambio, instrucciones especiales, etc."
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setSelected(null);
                    }}
                    disabled={rescheduling}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={rescheduling}
                  >
                    {rescheduling ? 'Reprogramando...' : 'Reprogramar Cita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <div className="text-center py-8">Cargando...</div>}
      </div>
    </div>
  );
};

export default AppointmentsCalendarPage; 