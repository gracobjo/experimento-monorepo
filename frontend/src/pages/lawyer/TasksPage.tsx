import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  expedienteId?: string;
  clientId?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  expediente?: {
    id: string;
    title: string;
    client: {
      user: {
        name: string;
        email: string;
      };
    };
  };
  client?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
  };
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskStats {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  canceladas: number;
  vencidas: number;
}

interface Expediente {
  id: string;
  title: string;
  client: {
    user: {
      name: string;
      email: string;
    };
  };
}

interface Client {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { user } = useAuth();

  // Formulario para crear tarea
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIA' as 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE',
    expedienteId: '',
    clientId: '',
    assignedTo: '',
  });

  // Cargar tareas, estadísticas, expedientes y clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [tasksResponse, statsResponse, expedientesResponse, clientsResponse] = await Promise.all([
          axios.get('/api/tasks', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/tasks/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/cases', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/users/clients', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setTasks(tasksResponse.data);
        setStats(statsResponse.data);
        setExpedientes(expedientesResponse.data);
        setClients(clientsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de tareas
  useEffect(() => {
    let filtered = tasks;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.expediente?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.client?.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filtro por prioridad
    if (priorityFilter !== 'todos') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setError(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIA',
      expedienteId: '',
      clientId: '',
      assignedTo: '',
    });
    setError(null);
  };

  const handleCreateTask = async () => {
    if (!createForm.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Filter out empty strings for optional fields
      const requestData = {
        title: createForm.title,
        description: createForm.description || undefined,
        dueDate: createForm.dueDate || undefined,
        priority: createForm.priority,
        expedienteId: createForm.expedienteId || undefined,
        clientId: createForm.clientId || undefined,
        assignedTo: createForm.assignedTo || undefined,
      };

      const response = await axios.post('/api/tasks', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(prev => [response.data, ...prev]);
      closeCreateModal();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.message || 'Error al crear la tarea');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar el estado local
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus as any } : t
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Error al actualizar el estado de la tarea');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError('Error al eliminar la tarea');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENTE': return 'bg-red-100 text-red-800';
      case 'ALTA': return 'bg-orange-100 text-orange-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAJA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROGRESO': return 'bg-blue-100 text-blue-800';
      case 'COMPLETADA': return 'bg-green-100 text-green-800';
      case 'CANCELADA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENTE': return 'Urgente';
      case 'ALTA': return 'Alta';
      case 'MEDIA': return 'Media';
      case 'BAJA': return 'Baja';
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En Progreso';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setPriorityFilter('todos');
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handlePriorityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriorityFilter(e.target.value);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
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
              <h1 className="text-3xl font-bold text-gray-900">Tareas Pendientes</h1>
              <p className="mt-2 text-gray-600">
                Gestiona y da seguimiento a todas tus tareas y recordatorios
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Nueva Tarea
            </button>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tareas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
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
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendientes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">En Progreso</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.enProgreso}</p>
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
                  <p className="text-sm font-medium text-gray-500">Completadas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completadas}</p>
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
                  <p className="text-sm font-medium text-gray-500">Canceladas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.canceladas}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Vencidas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.vencidas}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por título, descripción o expediente..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por estado"
              >
                <option value="todos">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por prioridad"
              >
                <option value="todos">Todas las prioridades</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
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
                🗑️ Limpiar
              </button>
            </div>
          </div>
          
          {/* Información de resultados */}
          {(searchTerm || statusFilter !== 'todos' || priorityFilter !== 'todos') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Resultados de búsqueda:</span>
                  {searchTerm && (
                    <span className="ml-2">"{searchTerm}"</span>
                  )}
                  {statusFilter !== 'todos' && (
                    <span className="ml-2">+ Estado: {statusFilter}</span>
                  )}
                  {priorityFilter !== 'todos' && (
                    <span className="ml-2">+ Prioridad: {priorityFilter}</span>
                  )}
                </div>
                <div className="text-sm text-blue-600">
                  {filteredTasks.length} de {tasks.length} tareas encontradas
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de tareas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-gray-50 ${
                    task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETADA' 
                      ? 'bg-red-50' 
                      : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.description || 'Sin descripción'}
                        </div>
                        {task.expediente && (
                          <div className="text-xs text-blue-600">
                            📋 {task.expediente.title}
                          </div>
                        )}
                        {task.client && (
                          <div className="text-xs text-green-600">
                            👤 {task.client.user.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}
                        aria-label={`Cambiar estado de tarea: ${task.title}`}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROGRESO">En Progreso</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.dueDate ? (
                        <div>
                          <div className={task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETADA' ? 'text-red-600 font-medium' : ''}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          {task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETADA' && (
                            <div className="text-xs text-red-500">⚠️ Vencida</div>
                          )}
                        </div>
                      ) : (
                        'Sin fecha límite'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assignedToUser?.name || 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openTaskModal(task)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
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

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron tareas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o crear una nueva tarea.
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles de tarea */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalles de la Tarea</h3>
                <button
                  onClick={closeTaskModal}
                  className="text-gray-400 hover:text-gray-600"
                  title="Cerrar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <p className="text-sm text-gray-900">{selectedTask.title}</p>
                </div>
                
                {selectedTask.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-sm text-gray-900">{selectedTask.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                    {getPriorityText(selectedTask.priority)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {getStatusText(selectedTask.status)}
                  </span>
                </div>
                
                {selectedTask.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha Límite</label>
                    <p className={`text-sm ${isOverdue(selectedTask.dueDate) && selectedTask.status !== 'COMPLETADA' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                      {isOverdue(selectedTask.dueDate) && selectedTask.status !== 'COMPLETADA' && (
                        <span className="ml-2 text-red-500">⚠️ Vencida</span>
                      )}
                    </p>
                  </div>
                )}
                
                {selectedTask.expediente && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expediente</label>
                    <p className="text-sm text-blue-600">{selectedTask.expediente.title}</p>
                    <p className="text-xs text-gray-500">Cliente: {selectedTask.expediente.client.user.name}</p>
                  </div>
                )}
                
                {selectedTask.client && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <p className="text-sm text-gray-900">{selectedTask.client.user.name}</p>
                    <p className="text-xs text-gray-500">{selectedTask.client.user.email}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asignado a</label>
                  <p className="text-sm text-gray-900">{selectedTask.assignedToUser?.name || 'Sin asignar'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado por</label>
                  <p className="text-sm text-gray-900">{selectedTask.createdByUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de creación</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeTaskModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear tarea */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nueva Tarea</h3>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600"
                  title="Cerrar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título de la tarea"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la tarea"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Límite
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Fecha límite de la tarea"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Prioridad de la tarea"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expediente (opcional)
                  </label>
                  <select
                    value={createForm.expedienteId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, expedienteId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Seleccionar expediente"
                  >
                    <option value="">Seleccionar expediente</option>
                    {expedientes.map(exp => (
                      <option key={exp.id} value={exp.id}>
                        {exp.title} - {exp.client.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente (opcional)
                  </label>
                  <select
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Seleccionar cliente"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.user.name} - {client.user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Crear Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 