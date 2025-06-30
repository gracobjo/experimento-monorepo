import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QuickActions from '../../components/QuickActions';

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


const CaseDetailPage = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log("Usuario en frontend:", user); // ← ¿Muestra role: 'ADMIN'?
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {



    const fetchCase = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCaseData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching case:', err);
        setError(err.response?.data?.message || 'Error al cargar el expediente');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!caseData) return;

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');
      await axios.patch(`/api/cases/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCaseData(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('Error al actualizar el estado del expediente');
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600">{error || 'Expediente no encontrado'}</div>
          <button
            onClick={() => navigate('/lawyer/cases')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Expedientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/lawyer/cases')}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Volver a Expedientes"
                  title="Volver a Expedientes"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              </div>
              <p className="mt-2 text-gray-600">
                Expediente creado el {new Date(caseData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/lawyer/cases/${id}/edit`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Editar
              </Link>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <QuickActions expedienteId={caseData.id} expedienteData={caseData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado del Expediente */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Expediente</h2>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
                  {getStatusText(caseData.status)}
                </span>
                {(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
                  <label>
                    <span className="sr-only">Cambiar estado del expediente</span>
                    <select
                      value={caseData.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Cambiar estado del expediente"
                    >
                      <option value="ABIERTO">Abierto</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="CERRADO">Cerrado</option>
                    </select>
                  </label>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700">
                {caseData.description || 'No hay descripción disponible para este expediente.'}
              </p>
            </div>

            {/* Documentos */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                  Subir Documento
                </button>
              </div>

              {caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                          <p className="text-xs text-gray-500">
                            Subido el {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay documentos subidos aún.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{caseData.client.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{caseData.client.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">DNI</p>
                  <p className="text-sm text-gray-900">{caseData.client.dni}</p>
                </div>
                {caseData.client.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{caseData.client.phone}</p>
                  </div>
                )}
                {caseData.client.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <p className="text-sm text-gray-900">{caseData.client.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Abogado */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Abogado Asignado</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{caseData.lawyer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{caseData.lawyer.email}</p>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Programar Cita
                </button>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                  Agregar Nota
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                  Enviar Mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPage; 