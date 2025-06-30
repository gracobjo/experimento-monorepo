import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  specialization?: string;
  isAvailable: boolean;
}

interface RemoteTool {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
  features: string[];
  instructions: string[];
}

interface CommonIssue {
  id: string;
  name: string;
  description: string;
  category: string;
  commonProblems: string[];
  solutions: string[];
}

const TeleassistanceRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [remoteTools, setRemoteTools] = useState<RemoteTool[]>([]);
  const [commonIssues, setCommonIssues] = useState<CommonIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [selectedIssueType, setSelectedIssueType] = useState<string>('');
  const [selectedRemoteTool, setSelectedRemoteTool] = useState<string>('');
  const [description, setDescription] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedTool, setSelectedTool] = useState<RemoteTool | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [assistantsResponse, toolsResponse, issuesResponse] = await Promise.all([
        axios.get('/api/teleassistance/available-assistants'),
        axios.get('/api/teleassistance/remote-tools'),
        axios.get('/api/teleassistance/common-issues')
      ]);

      setAssistants(assistantsResponse.data);
      setRemoteTools(toolsResponse.data);
      setCommonIssues(issuesResponse.data);
    } catch (error) {
      console.error('Error loading teleassistance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssistant || !selectedIssueType || !description) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData = {
        userId: user?.id,
        assistantId: selectedAssistant,
        issueType: selectedIssueType,
        description,
        remoteTool: selectedRemoteTool || undefined,
      };

      const response = await axios.post('/api/teleassistance/sessions', requestData);
      
      alert('Solicitud de teleasistencia enviada exitosamente. Te contactaremos pronto.');
      navigate('/client/teleassistance');
    } catch (error) {
      console.error('Error creating teleassistance session:', error);
      alert('Error al enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const showToolInstructions = (tool: RemoteTool) => {
    setSelectedTool(tool);
    setShowInstructions(true);
  };

  const getIssueTypeIcon = (issueType: string) => {
    const icons = {
      AUTOFIRMA: '🔐',
      CERTIFICADO_DIGITAL: '🆔',
      SEDES: '🏛️',
      CLAVE_PIN: '📱',
      NAVEGADOR: '🌐',
      SISTEMA_OPERATIVO: '💻',
      OTRO: '❓',
    };
    return icons[issueType as keyof typeof icons] || '❓';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🖥️ Solicitar Teleasistencia
          </h1>
          <p className="text-lg text-gray-600">
            ¿Necesitas ayuda con problemas de administración electrónica? Solicita asistencia remota
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Solicitud */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Nueva Solicitud de Teleasistencia
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selección de Asistente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Asistente *
                  </label>
                  <select
                    value={selectedAssistant}
                    onChange={(e) => setSelectedAssistant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona un asistente</option>
                    {assistants.map((assistant) => (
                      <option key={assistant.id} value={assistant.id}>
                        {assistant.name} ({assistant.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Problema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Problema *
                  </label>
                  <select
                    value={selectedIssueType}
                    onChange={(e) => setSelectedIssueType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona el tipo de problema</option>
                    {commonIssues.map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        {getIssueTypeIcon(issue.id)} {issue.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Problema *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe detalladamente el problema que estás experimentando..."
                    required
                  />
                </div>

                {/* Herramienta de Control Remoto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Herramienta de Control Remoto (Opcional)
                  </label>
                  <select
                    value={selectedRemoteTool}
                    onChange={(e) => setSelectedRemoteTool(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin preferencia</option>
                    {remoteTools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de Envío */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Solicitud de Teleasistencia'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Panel de Información */}
          <div className="space-y-6">
            {/* Herramientas de Control Remoto */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🛠️ Herramientas de Control Remoto
              </h3>
              <div className="space-y-3">
                {remoteTools.map((tool) => (
                  <div key={tool.id} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">{tool.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                    <button
                      onClick={() => showToolInstructions(tool)}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      Ver instrucciones
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Problemas Comunes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                ❓ Problemas Comunes
              </h3>
              <div className="space-y-3">
                {commonIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">{getIssueTypeIcon(issue.id)}</span>
                      <h4 className="font-medium text-gray-900">{issue.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                📞 Información de Contacto
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Una vez enviada tu solicitud, el asistente te contactará para coordinar la sesión de teleasistencia.
              </p>
              <div className="text-sm text-blue-700">
                <p>• Tiempo de respuesta: 15-30 minutos</p>
                <p>• Horario de atención: Lunes a Viernes 9:00-18:00</p>
                <p>• Sesiones gratuitas incluidas en tu plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Instrucciones */}
        {showInstructions && selectedTool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Instrucciones: {selectedTool.name}
                </h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Características:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {selectedTool.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Instrucciones de Instalación:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  {selectedTool.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="flex justify-between">
                <a
                  href={selectedTool.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Descargar {selectedTool.name}
                </a>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeleassistanceRequestPage; 