import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface ReportsData {
  tasks: {
    total: number;
    byStatus: {
      PENDIENTE: number;
      EN_PROGRESO: number;
      COMPLETADA: number;
      CANCELADA: number;
    };
    overdue: number;
  };
  cases: {
    total: number;
    byStatus: {
      ABIERTO: number;
      EN_PROCESO: number;
      CERRADO: number;
    };
  };
  appointments: {
    upcoming: number;
  };
}

const ReportsPage = () => {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/lawyer/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReportsData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching reports:', err);
        setError('Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROGRESO': return 'bg-blue-100 text-blue-800';
      case 'COMPLETADA': return 'bg-green-100 text-green-800';
      case 'CANCELADA': return 'bg-gray-100 text-gray-800';
      case 'ABIERTO': return 'bg-green-100 text-green-800';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800';
      case 'CERRADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En Progreso';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      case 'ABIERTO': return 'Abierto';
      case 'EN_PROCESO': return 'En Proceso';
      case 'CERRADO': return 'Cerrado';
      default: return status;
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

  if (!reportsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reportes</h1>
          <p className="mt-2 text-gray-600">
            Estadísticas y reportes personales de tu actividad
          </p>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tareas</p>
                <p className="text-2xl font-semibold text-gray-900">{reportsData.tasks.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Casos</p>
                <p className="text-2xl font-semibold text-gray-900">{reportsData.cases.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tareas Vencidas</p>
                <p className="text-2xl font-semibold text-gray-900">{reportsData.tasks.overdue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Próximas Citas</p>
                <p className="text-2xl font-semibold text-gray-900">{reportsData.appointments.upcoming}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y Estadísticas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estadísticas de Tareas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Tareas</h3>
            <div className="space-y-3">
              {Object.entries(reportsData.tasks.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
            
            {/* Gráfico de barras simple */}
            <div className="mt-6">
              <div className="flex items-end space-x-2 h-32">
                {Object.entries(reportsData.tasks.byStatus).map(([status, count]) => {
                  const maxCount = Math.max(...Object.values(reportsData.tasks.byStatus));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={status} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Estadísticas de Casos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Casos</h3>
            <div className="space-y-3">
              {Object.entries(reportsData.cases.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
            
            {/* Gráfico de pastel simple */}
            <div className="mt-6">
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  {(() => {
                    const total = Object.values(reportsData.cases.byStatus).reduce((a, b) => a + b, 0);
                    let currentAngle = 0;
                    const colors = ['#10B981', '#3B82F6', '#6B7280'];
                    
                    return Object.entries(reportsData.cases.byStatus).map(([status, count], index) => {
                      if (total === 0) return null;
                      const percentage = (count / total) * 100;
                      const angle = (percentage / 100) * 360;
                      
                      const slice = (
                        <div
                          key={status}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(from ${currentAngle}deg, ${colors[index]} 0deg, ${colors[index]} ${angle}deg, transparent ${angle}deg)`
                          }}
                        />
                      );
                      
                      currentAngle += angle;
                      return slice;
                    });
                  })()}
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                {Object.entries(reportsData.cases.byStatus).map(([status, count], index) => (
                  <div key={status} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: ['#10B981', '#3B82F6', '#6B7280'][index] }}
                    ></div>
                    <span className="text-xs text-gray-600">{getStatusText(status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 