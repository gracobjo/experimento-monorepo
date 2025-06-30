import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuickActions from '../../components/QuickActions';

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

const ClientCaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            onClick={() => navigate('/client/cases')}
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
                  onClick={() => navigate('/client/cases')}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Volver a Expedientes"
                  title="Volver a Expedientes"
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
                <p className="text-sm text-gray-600">
                  {caseData.status === 'ABIERTO' && 'Tu caso está siendo revisado por nuestro equipo legal.'}
                  {caseData.status === 'EN_PROCESO' && 'Tu caso está en proceso activo. Nuestro abogado está trabajando en él.'}
                  {caseData.status === 'CERRADO' && 'Tu caso ha sido completado y cerrado.'}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Caso</h2>
              <p className="text-gray-700">
                {caseData.description || 'No hay descripción disponible para este expediente.'}
              </p>
            </div>

            {/* Documentos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos del Caso</h2>
              
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
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay documentos disponibles aún.</p>
              )}
            </div>

            {/* Próximos Pasos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Pasos</h2>
              <div className="space-y-3">
                {caseData.status === 'ABIERTO' && (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-semibold">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Revisión Inicial</p>
                        <p className="text-sm text-gray-600">Nuestro abogado está revisando los detalles de tu caso.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-semibold">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Análisis Legal</p>
                        <p className="text-sm text-gray-400">Se realizará un análisis completo de tu situación legal.</p>
                      </div>
                    </div>
                  </>
                )}
                {caseData.status === 'EN_PROCESO' && (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Análisis Completado</p>
                        <p className="text-sm text-gray-600">El análisis inicial de tu caso ha sido completado.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-semibold">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Proceso Activo</p>
                        <p className="text-sm text-gray-600">Tu abogado está trabajando activamente en tu caso.</p>
                      </div>
                    </div>
                  </>
                )}
                {caseData.status === 'CERRADO' && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Caso Completado</p>
                      <p className="text-sm text-gray-600">Tu caso ha sido completado exitosamente.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Abogado */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tu Abogado</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {caseData.lawyer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{caseData.lawyer.name}</p>
                    <p className="text-sm text-gray-500">{caseData.lawyer.email}</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Contactar Abogado
                </button>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                  Programar Cita
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                  Enviar Mensaje
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                  Solicitar Información
                </button>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">info@despacholegal.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">Av. Principal 123, Ciudad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCaseDetailPage; 