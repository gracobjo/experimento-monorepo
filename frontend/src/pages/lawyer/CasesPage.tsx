import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  clientId: string;
  lawyerId: string;
  createdAt: string;
  client: {
    id: string;
    dni: string;
    phone?: string;
    address?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
  documents: {
    id: string;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

interface CaseStats {
  total: number;
  abiertos: number;
  enProceso: number;
  cerrados: number;
}

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Cargar expedientes
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [casesResponse, statsResponse] = await Promise.all([
          api.get('/cases', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/cases/stats', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setCases(casesResponse.data);
        setStats(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Error al cargar los expedientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Filtrado de casos
  useEffect(() => {
    let filtered = cases;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(caseItem => caseItem.status === statusFilter);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABIERTO': return 'bg-green-100 text-green-800';
      case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-800';
      case 'CERRADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ABIERTO': return 'Abierto';
      case 'EN_PROCESO': return 'En Proceso';
      case 'CERRADO': return 'Cerrado';
      default: return status;
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/cases/${caseId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar el estado local
      setCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId ? { ...c, status: newStatus as any } : c
        )
      );
    } catch (err) {
      console.error('Error updating case status:', err);
      setError('Error al actualizar el estado del expediente');
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Expedientes</h1>
              <p className="mt-2 text-gray-600">
                Gestiona y da seguimiento a todos tus casos legales
              </p>
            </div>
            <Link
              to="/lawyer/cases/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Nuevo Expediente
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Expedientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Abiertos</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.abiertos}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">En Proceso</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.enProceso}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cerrados</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.cerrados}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por título, cliente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por estado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de expedientes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de Expediente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                      <span>{caseItem.id}</span>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                        title="Copiar ID"
                        onClick={() => navigator.clipboard.writeText(caseItem.id)}
                      >
                        Copiar
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.client.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <Link
                          to={`/lawyer/cases/${caseItem.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/lawyer/cases/${caseItem.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron expedientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o crear un nuevo expediente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage; 