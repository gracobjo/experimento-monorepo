import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

interface Lawyer {
  id: string;
  name: string;
  email: string;
}

const CreateCasePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    lawyerId: user?.role === 'ABOGADO' ? user.id : ''
  });

  // Cargar clientes y abogados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [clientsResponse, lawyersResponse] = await Promise.all([
          api.get('/users/clients'),
          api.get('/users/lawyers')
        ]);

        setClients(clientsResponse.data);
        setLawyers(lawyersResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.clientId || !formData.lawyerId) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      await api.post('/cases', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/lawyer/cases');
    } catch (err: any) {
      console.error('Error creating case:', err);
      setError(err.response?.data?.message || 'Error al crear el expediente');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Expediente</h1>
              <p className="mt-2 text-gray-600">
                Crea un nuevo expediente legal
              </p>
            </div>
            <button
              onClick={() => navigate('/lawyer/cases')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Expediente *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Contrato de Compraventa"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe brevemente el caso..."
              />
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona un cliente</option>
                {clients.filter(client => client.user).length === 0 && (
                  <option disabled value="">No hay clientes disponibles</option>
                )}
                {clients.filter(client => client.user).map(client => (
                  <option key={client.id} value={client.id}>
                    {(client.user?.name || 'Sin nombre')} - {(client.user?.email || 'Sin email')} (DNI: {client.dni})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lawyerId" className="block text-sm font-medium text-gray-700 mb-2">
                Abogado Asignado *
              </label>
              <select
                id="lawyerId"
                name="lawyerId"
                value={formData.lawyerId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={user?.role === 'ABOGADO'}
              >
                <option value="">Selecciona un abogado</option>
                {lawyers.map(lawyer => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name} - {lawyer.email}
                  </option>
                ))}
              </select>
              {user?.role === 'ABOGADO' && (
                <p className="mt-1 text-sm text-gray-500">
                  Serás asignado automáticamente como abogado responsable
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/lawyer/cases')}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creando...' : 'Crear Expediente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCasePage; 