import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  clientId: string;
  lawyerId: string;
  createdAt: string;
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

const ClientCasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Cargar expedientes del cliente
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('/api/cases', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCases(response.data);
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
        caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.lawyer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Expedientes</h1>
            <p className="mt-2 text-gray-600">
              Revisa el estado de tus casos legales
            </p>
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
                placeholder="Buscar por título, descripción o abogado..."
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
                id="statusFilter"
                aria-label="Estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* Lista de expedientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {caseItem.title}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {getStatusText(caseItem.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {caseItem.description || 'Sin descripción disponible'}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {caseItem.lawyer.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8" />
                    </svg>
                    {caseItem.documents.length} documentos
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/client/cases/${caseItem.id}`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-center text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Ver Detalles
                  </Link>
                  <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron expedientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {cases.length === 0 
                ? 'Aún no tienes expedientes asignados. Contacta con un abogado para iniciar un caso.'
                : 'Intenta ajustar los filtros de búsqueda.'
              }
            </p>
            {cases.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/client/appointments"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Programar Consulta
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCasesPage; 