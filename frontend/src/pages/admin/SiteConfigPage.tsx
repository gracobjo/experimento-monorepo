import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'image' | 'color' | 'boolean' | 'json';
  category: 'branding' | 'layout' | 'contact' | 'social' | 'general';
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SiteConfigCategory {
  category: string;
  configs: SiteConfig[];
}

const SiteConfigPage: React.FC = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<SiteConfigCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<SiteConfig | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<SiteConfig>>({
    key: '',
    value: '',
    type: 'string',
    category: 'general',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/site-config/categories');
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching site configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      await axios.post('/api/site-config', newConfig);
      setShowCreateForm(false);
      setNewConfig({
        key: '',
        value: '',
        type: 'string',
        category: 'general',
        description: '',
        isPublic: false
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error creating config:', error);
    }
  };

  const handleUpdateConfig = async () => {
    if (!editingConfig) return;
    
    try {
      await axios.patch(`/api/site-config/${editingConfig.id}`, editingConfig);
      setEditingConfig(null);
      fetchConfigs();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración?')) return;
    
    try {
      await axios.delete(`/api/site-config/${id}`);
      fetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  const handleQuickUpdate = async (key: string, value: string) => {
    try {
      await axios.patch(`/api/site-config/key/${key}`, { value });
      fetchConfigs();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      branding: '🎨 Marca',
      layout: '📐 Diseño',
      contact: '📞 Contacto',
      social: '🌐 Social',
      general: '⚙️ General'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      string: 'Texto',
      image: 'Imagen',
      color: 'Color',
      boolean: 'Booleano',
      json: 'JSON'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderConfigValue = (config: SiteConfig) => {
    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.value === 'true'}
              onChange={(e) => handleQuickUpdate(config.key, e.target.checked.toString())}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              {config.value === 'true' ? 'Activado' : 'Desactivado'}
            </span>
          </div>
        );
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.value}
              onChange={(e) => handleQuickUpdate(config.key, e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded"
            />
            <span className="text-sm font-mono">{config.value}</span>
          </div>
        );
      case 'image':
        return (
          <div className="flex items-center space-x-2">
            <img
              src={config.value}
              alt="Preview"
              className="w-8 h-8 object-cover border border-gray-300 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <input
              type="text"
              value={config.value}
              onChange={(e) => handleQuickUpdate(config.key, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="URL de la imagen"
            />
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={config.value}
            onChange={(e) => handleQuickUpdate(config.key, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="Valor"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuraciones del sitio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración del Sitio</h1>
          <p className="mt-2 text-gray-600">
            Gestiona la configuración general del sitio web
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ➕ Nueva Configuración
          </button>
          <button
            onClick={async () => {
              try {
                await axios.post('/api/site-config/initialize');
                fetchConfigs();
                alert('Configuraciones por defecto inicializadas');
              } catch (error) {
                console.error('Error initializing configs:', error);
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            🔄 Inicializar Configuraciones
          </button>
        </div>

        {/* Create Config Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clave
                </label>
                <input
                  type="text"
                  value={newConfig.key}
                  onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: site_name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  value={newConfig.value}
                  onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Valor de la configuración"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={newConfig.type}
                  onChange={(e) => setNewConfig({ ...newConfig, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="string">Texto</option>
                  <option value="image">Imagen</option>
                  <option value="color">Color</option>
                  <option value="boolean">Booleano</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={newConfig.category}
                  onChange={(e) => setNewConfig({ ...newConfig, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="branding">Marca</option>
                  <option value="layout">Diseño</option>
                  <option value="contact">Contacto</option>
                  <option value="social">Social</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de la configuración"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newConfig.isPublic}
                  onChange={(e) => setNewConfig({ ...newConfig, isPublic: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Configuración Pública
                </label>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleCreateConfig}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                ✅ Crear Configuración
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Configurations by Category */}
        <div className="space-y-6">
          {configs.map((category) => (
            <div key={category.category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
                <h3 className="text-lg font-semibold">{getCategoryLabel(category.category)}</h3>
                <p className="text-gray-200 text-sm">
                  {category.configs.length} configuración{category.configs.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {category.configs.map((config) => (
                    <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{config.key}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {getTypeLabel(config.type)}
                            </span>
                            {config.isPublic && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Público
                              </span>
                            )}
                          </div>
                          {config.description && (
                            <p className="text-sm text-gray-600">{config.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingConfig(editingConfig?.id === config.id ? null : config)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            {editingConfig?.id === config.id ? '❌ Cancelar' : '✏️ Editar'}
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>

                      {editingConfig?.id === config.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Valor
                            </label>
                            {config.type === 'boolean' ? (
                              <select
                                value={config.value}
                                onChange={(e) => setEditingConfig({ ...config, value: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="true">Activado</option>
                                <option value="false">Desactivado</option>
                              </select>
                            ) : config.type === 'color' ? (
                              <input
                                type="color"
                                value={config.value}
                                onChange={(e) => setEditingConfig({ ...config, value: e.target.value })}
                                className="w-full h-10 border border-gray-300 rounded-md"
                              />
                            ) : (
                              <input
                                type="text"
                                value={config.value}
                                onChange={(e) => setEditingConfig({ ...config, value: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción
                            </label>
                            <input
                              type="text"
                              value={config.description || ''}
                              onChange={(e) => setEditingConfig({ ...config, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={config.isPublic}
                              onChange={(e) => setEditingConfig({ ...config, isPublic: e.target.checked })}
                              className="mr-2"
                            />
                            <label className="text-sm font-medium text-gray-700">
                              Configuración Pública
                            </label>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handleUpdateConfig}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                            >
                              💾 Guardar Cambios
                            </button>
                            <button
                              onClick={() => setEditingConfig(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                            >
                              ❌ Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor Actual
                          </label>
                          {renderConfigValue(config)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {configs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay configuraciones del sitio</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              ➕ Crear Primera Configuración
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteConfigPage; 