import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

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

const TasksManagementPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.expediente?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.client?.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedToUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'todos') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredTasks, sortOrder]);

  const handleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Error al eliminar tarea');
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
              <p className="mt-2 text-gray-600">
                Administra todas las tareas del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por título, descripción, expediente, cliente o asignado..."
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
                onChange={(e) => setPriorityFilter(e.target.value)}
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
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                  setPriorityFilter('todos');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={handleSortOrder}>
                    Vencimiento
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
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
                {sortedTasks.map((task) => (
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
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

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron tareas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksManagementPage; 