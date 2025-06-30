import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Client {
  id: string;
  dni: string;
  phone?: string;
  address?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    expedientes: number;
    appointments: number;
  };
}

interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  totalCases: number;
  totalAppointments: number;
  averageCasesPerClient: number;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const { user } = useAuth();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Cargar clientes y estadísticas
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [clientsResponse, statsResponse] = await Promise.all([
          api.get('/users/clients/my'),
          api.get('/users/clients/stats')
        ]);

        setClients(clientsResponse.data);
        setStats(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filtrado de clientes
  useEffect(() => {
    let filtered = clients;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter === 'activos') {
      filtered = filtered.filter(client => 
        client._count?.expedientes && client._count.expedientes > 0
      );
    } else if (statusFilter === 'inactivos') {
      filtered = filtered.filter(client => 
        !client._count?.expedientes || client._count.expedientes === 0
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter]);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Función para extraer el primer apellido del nombre completo
  function getFirstSurname(fullName: string) {
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts[1].toLowerCase() : '';
  }

  // Ordenar clientes por primer apellido
  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients].sort((a, b) => {
      const surnameA = getFirstSurname(a.user.name);
      const surnameB = getFirstSurname(b.user.name);
      if (surnameA < surnameB) return sortOrder === 'asc' ? -1 : 1;
      if (surnameA > surnameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredClients, sortOrder]);

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setShowClientModal(false);
  };

  const getStatusColor = (client: Client) => {
    const hasActiveCases = client._count?.expedientes && client._count.expedientes > 0;
    return hasActiveCases ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (client: Client) => {
    const hasActiveCases = client._count?.expedientes && client._count.expedientes > 0;
    return hasActiveCases ? 'Activo' : 'Inactivo';
  };

  const exportClientsData = () => {
    const data = filteredClients.map(client => ({
      Nombre: client.user.name,
      Email: client.user.email,
      DNI: client.dni,
      Teléfono: client.phone || 'N/A',
      Dirección: client.address || 'N/A',
      Estado: getStatusText(client),
      Expedientes: client._count?.expedientes || 0,
      Citas: client._count?.appointments || 0,
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmailToClient = (client: Client) => {
    const subject = encodeURIComponent('Consulta Legal - Despacho');
    const body = encodeURIComponent(`Estimado/a ${client.user.name},\n\nEsperamos que se encuentre bien.\n\nSaludos cordiales,\nSu equipo legal`);
    window.open(`mailto:${client.user.email}?subject=${subject}&body=${body}`);
  };

  const callClient = (client: Client) => {
    if (client.phone) {
      window.open(`tel:${client.phone}`);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    // Simular un pequeño delay para mostrar el estado de búsqueda
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    // Ejecutar búsqueda automáticamente al cambiar el filtro
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Limpiar timeout anterior si existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Si hay texto, mostrar estado de búsqueda después de un delay
    if (value.trim()) {
      setIsSearching(true);
      const newTimeout = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      setSearchTimeout(newTimeout);
    } else {
      setIsSearching(false);
    }
  };

  const handleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Clientes</h1>
              <p className="mt-2 text-gray-600">
                Gestiona y da seguimiento a todos tus clientes
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportClientsData}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Exportar Datos
              </button>
              <Link
                to="/lawyer/cases/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Nuevo Cliente
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Clientes</p>
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
                  <p className="text-sm font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inactivos</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Expedientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCases}</p>
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
                  <p className="text-sm font-medium text-gray-500">Total Citas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Promedio Expedientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.averageCasesPerClient}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre, email, DNI o teléfono..."
                value={searchTerm}
                onChange={handleSearchTermChange}
                onKeyDown={handleKeyPress}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isSearching && searchTerm ? 'bg-blue-50 border-blue-300' : ''
                }`}
              />
              {isSearching && searchTerm && (
                <div className="mt-1 text-xs text-blue-600 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Buscando...
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                aria-label="Filtrar por estado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Buscando...
                  </div>
                ) : (
                  '🔍 Buscar'
                )}
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                🗑️ Limpiar Filtros
              </button>
            </div>
          </div>
          
          {/* Información de resultados */}
          {(searchTerm || statusFilter !== 'todos') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Resultados de búsqueda:</span>
                  {searchTerm && (
                    <span className="ml-2">
                      "{searchTerm}" 
                      {statusFilter !== 'todos' && ` + ${statusFilter}`}
                    </span>
                  )}
                  {!searchTerm && statusFilter !== 'todos' && (
                    <span className="ml-2">Estado: {statusFilter}</span>
                  )}
                </div>
                <div className="text-sm text-blue-600">
                  {filteredClients.length} de {clients.length} clientes encontrados
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de clientes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={handleSortOrder}>
                    Cliente
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expedientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Citas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {client.dni}
                        </div>
                        {client.address && (
                          <div className="text-sm text-gray-500">
                            {client.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {client.user.email}
                        </div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client)}`}>
                        {getStatusText(client)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client._count?.expedientes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client._count?.appointments || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openClientModal(client)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Ver Detalles
                          </button>
                          <Link
                            to={`/lawyer/cases/new?clientId=${client.id}`}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Nuevo Expediente
                          </Link>
                        </div>
                        <div className="flex space-x-2">
                          {client.user.email && (
                            <button
                              onClick={() => sendEmailToClient(client)}
                              className="text-purple-600 hover:text-purple-900 text-xs"
                              title="Enviar email"
                            >
                              📧 Email
                            </button>
                          )}
                          {client.phone && (
                            <button
                              onClick={() => callClient(client)}
                              className="text-orange-600 hover:text-orange-900 text-xs"
                              title="Llamar"
                            >
                              📞 Llamar
                            </button>
                          )}
                          <Link
                            to={`/lawyer/appointments?clientId=${client.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-xs"
                          >
                            📅 Cita
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron clientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o agregar nuevos clientes.
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles del cliente */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalles del Cliente</h3>
                <button
                  onClick={closeClientModal}
                  className="text-gray-400 hover:text-gray-600"
                  title="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-sm text-gray-900">{selectedClient.user.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedClient.user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">DNI</label>
                  <p className="text-sm text-gray-900">{selectedClient.dni}</p>
                </div>
                
                {selectedClient.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-sm text-gray-900">{selectedClient.phone}</p>
                  </div>
                )}
                
                {selectedClient.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <p className="text-sm text-gray-900">{selectedClient.address}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedClient)}`}>
                    {getStatusText(selectedClient)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expedientes</label>
                    <p className="text-sm text-gray-900">{selectedClient._count?.expedientes || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Citas</label>
                    <p className="text-sm text-gray-900">{selectedClient._count?.appointments || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeClientModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cerrar
                </button>
                {selectedClient.user.email && (
                  <button
                    onClick={() => sendEmailToClient(selectedClient)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Enviar Email
                  </button>
                )}
                {selectedClient.phone && (
                  <button
                    onClick={() => callClient(selectedClient)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Llamar
                  </button>
                )}
                <Link
                  to={`/lawyer/cases/new?clientId=${selectedClient.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Nuevo Expediente
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage; 