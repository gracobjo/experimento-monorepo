import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

interface MenuItem {
  id?: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  isExternal: boolean;
  parentId?: string;
  children?: MenuItem[];
}

interface MenuConfig {
  id: string;
  name: string;
  role: 'ADMIN' | 'ABOGADO' | 'CLIENTE';
  orientation: 'horizontal' | 'vertical';
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

const MenuConfigPage: React.FC = () => {
  const { user } = useAuth();
  const [menuConfigs, setMenuConfigs] = useState<MenuConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<MenuConfig | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuConfig | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMenu, setNewMenu] = useState<Partial<MenuConfig>>({
    name: '',
    role: 'ADMIN',
    orientation: 'horizontal',
    isActive: true,
    items: []
  });

  useEffect(() => {
    fetchMenuConfigs();
  }, []);

  const fetchMenuConfigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/menu-config');
      setMenuConfigs(response.data);
    } catch (error) {
      console.error('Error fetching menu configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async () => {
    try {
      await axios.post('/api/menu-config', newMenu);
      setShowCreateForm(false);
      setNewMenu({
        name: '',
        role: 'ADMIN',
        orientation: 'horizontal',
        isActive: true,
        items: []
      });
      fetchMenuConfigs();
    } catch (error) {
      console.error('Error creating menu:', error);
    }
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;
    
    try {
      await axios.patch(`/api/menu-config/${editingMenu.id}`, editingMenu);
      setEditingMenu(null);
      fetchMenuConfigs();
    } catch (error) {
      console.error('Error updating menu:', error);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este menú?')) return;
    
    try {
      await axios.delete(`/api/menu-config/${id}`);
      fetchMenuConfigs();
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const addMenuItem = (menu: MenuConfig) => {
    const newItem: MenuItem = {
      label: 'Nuevo elemento',
      url: '/',
      icon: '📄',
      order: menu.items.length,
      isVisible: true,
      isExternal: false
    };

    const updatedMenu = {
      ...menu,
      items: [...menu.items, newItem]
    };

    if (editingMenu?.id === menu.id) {
      setEditingMenu(updatedMenu);
    }
  };

  const updateMenuItem = (menu: MenuConfig, index: number, field: keyof MenuItem, value: any) => {
    const updatedItems = [...menu.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    const updatedMenu = { ...menu, items: updatedItems };

    if (editingMenu?.id === menu.id) {
      setEditingMenu(updatedMenu);
    }
  };

  const removeMenuItem = (menu: MenuConfig, index: number) => {
    const updatedItems = menu.items.filter((_, i) => i !== index);
    const updatedMenu = { ...menu, items: updatedItems };

    if (editingMenu?.id === menu.id) {
      setEditingMenu(updatedMenu);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      ADMIN: 'Administrador',
      ABOGADO: 'Abogado',
      CLIENTE: 'Cliente'
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuraciones de menús...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🍽️ Configuración de Menús</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los menús de navegación para cada rol de usuario
          </p>
        </div>

        {/* Create New Menu Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ➕ Crear Nuevo Menú
          </button>
        </div>

        {/* Create Menu Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Menú</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Menú
                </label>
                <input
                  type="text"
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Menú Principal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={newMenu.role}
                  onChange={(e) => setNewMenu({ ...newMenu, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="ABOGADO">Abogado</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientación
                </label>
                <select
                  value={newMenu.orientation}
                  onChange={(e) => setNewMenu({ ...newMenu, orientation: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMenu.isActive}
                  onChange={(e) => setNewMenu({ ...newMenu, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Menú Activo
                </label>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleCreateMenu}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                ✅ Crear Menú
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

        {/* Menu Configs List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {menuConfigs.map((menu) => (
            <div key={menu.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{menu.name}</h3>
                    <p className="text-blue-100 text-sm">
                      {getRoleLabel(menu.role)} • {menu.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {menu.isActive && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        Activo
                      </span>
                    )}
                    <button
                      onClick={() => setEditingMenu(editingMenu?.id === menu.id ? null : menu)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors"
                    >
                      {editingMenu?.id === menu.id ? '❌ Cancelar' : '✏️ Editar'}
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                {editingMenu?.id === menu.id ? (
                  // Edit Mode
                  <div>
                    <div className="mb-4">
                      <button
                        onClick={() => addMenuItem(editingMenu)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        ➕ Agregar Elemento
                      </button>
                    </div>
                    {editingMenu.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateMenuItem(editingMenu, index, 'label', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Etiqueta"
                          />
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateMenuItem(editingMenu, index, 'url', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="URL"
                          />
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => updateMenuItem(editingMenu, index, 'icon', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Icono (emoji)"
                          />
                          <input
                            type="number"
                            value={item.order}
                            onChange={(e) => updateMenuItem(editingMenu, index, 'order', parseInt(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Orden"
                          />
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={item.isVisible}
                                onChange={(e) => updateMenuItem(editingMenu, index, 'isVisible', e.target.checked)}
                                className="mr-2"
                              />
                              Visible
                            </label>
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={item.isExternal}
                                onChange={(e) => updateMenuItem(editingMenu, index, 'isExternal', e.target.checked)}
                                className="mr-2"
                              />
                              Externo
                            </label>
                          </div>
                          <button
                            onClick={() => removeMenuItem(editingMenu, index)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={handleUpdateMenu}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        💾 Guardar Cambios
                      </button>
                      <button
                        onClick={() => setEditingMenu(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    {menu.items.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay elementos en este menú</p>
                    ) : (
                      <div className="space-y-2">
                        {menu.items
                          .sort((a, b) => a.order - b.order)
                          .map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{item.icon}</span>
                                <div>
                                  <p className="font-medium">{item.label}</p>
                                  <p className="text-sm text-gray-500">{item.url}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!item.isVisible && (
                                  <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">
                                    Oculto
                                  </span>
                                )}
                                {item.isExternal && (
                                  <span className="text-xs bg-blue-300 text-blue-600 px-2 py-1 rounded">
                                    Externo
                                  </span>
                                )}
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  {item.order}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {menuConfigs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay configuraciones de menús creadas</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              ➕ Crear Primer Menú
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuConfigPage; 