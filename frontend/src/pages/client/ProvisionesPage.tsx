import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClientProvisions } from '../../api/provisionFondos';
import api from '../../api/axios';

interface Provision {
  id: string;
  amount: number;
  date: string;
  description?: string;
  expedienteId?: string;
  invoiceId?: string;
  expediente?: {
    id: string;
    title: string;
    lawyer?: {
      id: string;
      name: string;
      email: string;
    };
  };
  invoice?: {
    id: string;
    numeroFactura: string;
    importeTotal: number;
    fechaFactura: string;
  };
}

const ProvisionesPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        if (!token) throw new Error('No token available');
        
        // Obtener directamente el perfil de cliente del usuario actual
        const clientRes = await api.get(`/users/clients/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (clientRes.data) {
          setClientProfile(clientRes.data);
          await fetchProvisions(clientRes.data.id);
        } else {
          setError('No se encontró el perfil de cliente');
        }
      } catch (err) {
        console.error('Error fetching client profile:', err);
        setError('Error al cargar el perfil de cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [token, user]);

  const fetchProvisions = async (clientId: string) => {
    try {
      const data = await getClientProvisions(clientId, token!);
      setProvisions(data);
    } catch (err) {
      setError('Error al cargar las provisiones');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (provision: Provision) => {
    if (provision.invoiceId) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Facturada
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando provisiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingProvisions = provisions.filter(p => !p.invoiceId);
  const invoicedProvisions = provisions.filter(p => p.invoiceId);
  const totalPending = pendingProvisions.reduce((sum, p) => sum + p.amount, 0);
  const totalInvoiced = invoicedProvisions.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Provisiones de Fondos
        </h1>
        <p className="text-gray-600">
          Aquí puedes ver todas las provisiones de fondos asociadas a tus expedientes
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Provisiones</p>
              <p className="text-2xl font-semibold text-gray-900">{provisions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Facturadas</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalInvoiced)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provisiones Pendientes */}
      {pendingProvisions.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Provisiones Pendientes ({pendingProvisions.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Provisiones que aún no han sido facturadas
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abogado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingProvisions.map((provision) => (
                  <tr key={provision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(provision.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(provision.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {provision.description || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provision.expediente?.title || 'Sin expediente'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provision.expediente?.lawyer?.name || 'No asignado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provisiones Facturadas */}
      {invoicedProvisions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Provisiones Facturadas ({invoicedProvisions.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Provisiones que ya han sido incluidas en facturas
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Provisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoicedProvisions.map((provision) => (
                  <tr key={provision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(provision.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(provision.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {provision.description || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provision.expediente?.title || 'Sin expediente'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{provision.invoice?.numeroFactura}</div>
                        <div className="text-gray-500">{formatDate(provision.invoice?.fechaFactura || '')}</div>
                        <div className="text-gray-500">{formatCurrency(provision.invoice?.importeTotal || 0)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(provision)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay provisiones */}
      {provisions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay provisiones de fondos</h3>
          <p className="text-gray-500">
            Aún no se han creado provisiones de fondos para tus expedientes.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProvisionesPage; 