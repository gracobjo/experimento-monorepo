import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

interface SystemReports {
  casesByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
  tasksByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
  appointmentsByMonth: Array<{
    date: string;
    _count: { date: number };
  }>;
  userActivity: Array<{
    id: string;
    name: string;
    role: string;
    createdAt: string;
    expedientesAsLawyer: Array<{ id: string }>;
    appointmentsAsLawyer: Array<{ id: string }>;
    assignedTasks: Array<{ id: string }>;
  }>;
  documentStats: Array<{
    mimeType: string;
    _count: { mimeType: number };
    _sum: { fileSize: number | null };
  }>;
}

const ReportsPage = () => {
  const [reports, setReports] = useState<SystemReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ABIERTO': return 'Abierto';
      case 'EN_PROCESO': return 'En Proceso';
      case 'CERRADO': return 'Cerrado';
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En Progreso';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'ABOGADO': return 'Abogado';
      case 'CLIENTE': return 'Cliente';
      default: return role;
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Reportes del Sistema</h1>
              <p className="mt-2 text-gray-600">
                Análisis y estadísticas del sistema
              </p>
            </div>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Actualizar
            </button>
          </div>
        </div>

        {reports && (
          <div className="space-y-6">
            {/* Estadísticas de Expedientes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Expedientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reports.casesByStatus.map((item) => (
                  <div key={item.status} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      {getStatusText(item.status)}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {item._count.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas de Tareas */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Tareas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {reports.tasksByStatus.map((item) => (
                  <div key={item.status} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      {getStatusText(item.status)}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {item._count.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actividad de Usuarios */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad de Usuarios</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expedientes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Citas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tareas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.userActivity.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getRoleText(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.expedientesAsLawyer.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.appointmentsAsLawyer.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.assignedTasks.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estadísticas de Documentos */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Documentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.documentStats.map((item) => (
                  <div key={item.mimeType} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      {item.mimeType}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {item._count.mimeType}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(item._sum.fileSize)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citas por Mes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Citas por Mes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.appointmentsByMonth.map((item) => (
                  <div key={item.date} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      {new Date(item.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {item._count.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage; 