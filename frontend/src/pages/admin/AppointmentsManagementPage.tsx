import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface Appointment {
  id: string;
  date: string;
  location?: string;
  notes?: string;
  client: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
}

const AppointmentsManagementPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, dateFilter]);

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredAppointments, sortOrder]);

  const handleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError(err.response?.data?.message || 'Error al eliminar cita');
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const isPast = (date: string) => {
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
              <p className="mt-2 text-gray-600">
                Administra todas las citas del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por cliente, abogado, ubicación o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por fecha"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de citas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={handleSortOrder}>
                    Fecha y Hora
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abogado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAppointments.map((appointment) => (
                  <tr key={appointment.id} className={`hover:bg-gray-50 ${
                    isPast(appointment.date) ? 'bg-gray-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.client.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.client.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.lawyer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.lawyer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.location || 'No especificada'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isUpcoming(appointment.date) ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Próxima
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Pasada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManagementPage; 