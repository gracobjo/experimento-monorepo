import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/FileUpload';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  expedienteId: string;
  uploadedAt: string;
  uploadedByUser: {
    id: string;
    name: string;
    email: string;
  };
  expediente: {
    id: string;
    title: string;
    client: {
      user: {
        name: string;
      };
    };
  };
}

interface DocumentStats {
  total: number;
  totalSize: number;
  byType: {
    type: string;
    count: number;
  }[];
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    expedienteId: '',
    description: ''
  });
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const { user } = useAuth();

  // Cargar documentos y estadísticas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [documentsResponse, statsResponse, expedientesResponse] = await Promise.all([
          axios.get('/api/documents', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/documents/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/cases', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDocuments(documentsResponse.data);
        setStats(statsResponse.data);
        setExpedientes(expedientesResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Error al cargar los documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de documentos
  useEffect(() => {
    let filtered = documents;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.expediente.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.expediente.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'todos') {
      filtered = filtered.filter(doc => doc.mimeType === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, typeFilter]);

  const handleFileSelect = (files: File[]) => {
    console.log('handleFileSelect called with:', files.length, 'files');
    console.log('Files:', files.map(f => f.name));
    console.log('Files details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    // Verificar si hay duplicados
    const uniqueFiles = files.filter((file, index, self) => 
      index === self.findIndex(f => f.name === file.name && f.size === file.size)
    );
    
    if (uniqueFiles.length !== files.length) {
      console.warn('Se encontraron archivos duplicados, eliminando...');
    }
    
    setSelectedFiles(uniqueFiles);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setError(null);
    // Limpiar archivos seleccionados al abrir el modal
    setSelectedFiles([]);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadForm({ expedienteId: '', description: '' });
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadForm.expedienteId) {
      setError('Por favor selecciona archivos y un expediente');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expedienteId', uploadForm.expedienteId);
        if (uploadForm.description) {
          formData.append('description', uploadForm.description);
        }

        return axios.post('/api/documents/upload', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      });

      console.log('Subiendo archivos...');
      const uploadResults = await Promise.all(uploadPromises);
      console.log('Resultados de subida:', uploadResults.map(r => r.data));

      // Recargar documentos
      console.log('Recargando documentos...');
      const response = await axios.get('/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Documentos cargados:', response.data);
      
      // Verificar que los documentos tengan la estructura correcta
      const validDocuments = response.data.filter((doc: any) => {
        const isValid = doc && doc.id && doc.originalName;
        if (!isValid) {
          console.warn('Documento inválido encontrado:', doc);
        }
        return isValid;
      });
      
      setDocuments(validDocuments);

      // Cerrar modal y limpiar formulario
      closeUploadModal();
      
    } catch (err: any) {
      console.error('Error uploading files:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError('Error al eliminar el documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📝';
    if (mimeType.includes('word')) return '📄';
    return '📎';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
              <p className="mt-2 text-gray-600">
                Gestiona todos los documentos legales
              </p>
            </div>
            <button
              onClick={openUploadModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Subir Documentos
            </button>
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
                  <p className="text-sm font-medium text-gray-500">Total Documentos</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tamaño Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatFileSize(stats.totalSize)}</p>
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
                  <p className="text-sm font-medium text-gray-500">PDFs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.byType.filter(t => t.type.includes('pdf')).reduce((sum, t) => sum + t.count, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Imágenes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.byType.filter(t => t.type.includes('image')).reduce((sum, t) => sum + t.count, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas detalladas */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas por Tipo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.byType.filter(t => t.type.includes('pdf')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">PDFs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.byType.filter(t => t.type.includes('text')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Documentos de Texto</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.byType.filter(t => t.type.includes('image')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Imágenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.byType.filter(t => t.type.includes('word') || t.type.includes('document')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Documentos Word</div>
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
                placeholder="Buscar por nombre, expediente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Archivo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filtrar por tipo de archivo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los tipos</option>
                <option value="application/pdf">PDF</option>
                <option value="text/plain">Texto</option>
                <option value="image/jpeg">Imágenes</option>
                <option value="application/msword">Word</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('todos');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subido Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(doc.mimeType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.originalName}
                          </div>
                          {doc.description && (
                            <div className="text-sm text-gray-500">
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/lawyer/cases/${doc.expedienteId}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        {doc.expediente?.title || 'Sin título'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.expediente?.client?.user?.name || 'Cliente no disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.uploadedByUser?.name || 'Usuario no disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Descargar
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
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

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o subir nuevos documentos.
            </p>
          </div>
        )}
      </div>

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Documentos</h3>
            
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expediente
                </label>
                <select
                  id="expediente-select"
                  aria-label="Expediente"
                  value={uploadForm.expedienteId}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expedienteId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un expediente</option>
                  {expedientes.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} - {exp.client.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del documento..."
                />
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                maxFiles={5}
                maxSize={5 * 1024 * 1024}
              />

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
                      <button
                        onClick={clearSelectedFiles}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Limpiar
                      </button>
                    </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name} ({formatFileSize(file.size)})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                  onClick={closeUploadModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0 || !uploadForm.expedienteId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Subiendo...' : 'Subir Documentos'}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default DocumentsPage; 