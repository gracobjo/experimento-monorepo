import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import ComponentLibrary from './ComponentLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import { ComponentConfig, LayoutConfig } from './types';

const HomeBuilder: React.FC = () => {
  const [layout, setLayout] = useState<LayoutConfig>({
    id: 'home-layout',
    name: 'Home Page',
    components: [],
    version: 1,
    lastModified: new Date().toISOString()
  });
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  console.log('HomeBuilder - Rendering, components:', layout.components.length);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log('Drag end:', event);
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Si viene del panel de componentes
    if (active.data.current?.type === 'component-library') {
      const componentType = active.id as string;
      const newComponent: ComponentConfig = {
        id: `component-${Date.now()}`,
        type: componentType,
        props: getDefaultProps(componentType),
        order: layout.components.length
      };

      console.log('Adding new component:', newComponent);

      setLayout(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }));
    }
    // Si es reordenamiento dentro del canvas
    else if (active.id !== over.id) {
      setLayout(prev => ({
        ...prev,
        components: arrayMove(
          prev.components,
          prev.components.findIndex(comp => comp.id === active.id),
          prev.components.findIndex(comp => comp.id === over.id)
        ).map((comp, index) => ({ ...comp, order: index }))
      }));
    }
  }, [layout.components]);

  const handleComponentSelect = useCallback((component: ComponentConfig) => {
    console.log('Component selected:', component);
    setSelectedComponent(component);
  }, []);

  const handleComponentUpdate = useCallback((componentId: string, newProps: any) => {
    setLayout(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, props: { ...comp.props, ...newProps } } : comp
      )
    }));
  }, []);

  const handleComponentDelete = useCallback((componentId: string) => {
    setLayout(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }));
    setSelectedComponent(null);
  }, []);

  const handleSave = async () => {
    try {
      console.log('Saving layout:', layout);
      alert('Layout guardado exitosamente! (Modo demo)');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Error al guardar el layout');
    }
  };

  const handleLoad = async () => {
    try {
      console.log('Loading layout...');
      alert('Layout cargado exitosamente! (Modo demo)');
    } catch (error) {
      console.error('Error loading layout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎨 Home Builder</h1>
              <p className="text-sm text-gray-600">Diseña la página principal arrastrando componentes</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isPreviewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isPreviewMode ? 'Editar' : 'Vista Previa'}
              </button>
              <button
                onClick={handleLoad}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Cargar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Component Library */}
            {!isPreviewMode && (
              <div className="col-span-3">
                <ComponentLibrary />
              </div>
            )}

            {/* Canvas */}
            <div className={isPreviewMode ? 'col-span-12' : 'col-span-6'}>
              <Canvas
                layout={layout}
                onComponentSelect={handleComponentSelect}
                onComponentDelete={handleComponentDelete}
                selectedComponent={selectedComponent}
                isPreviewMode={isPreviewMode}
              />
            </div>

            {/* Properties Panel */}
            {!isPreviewMode && selectedComponent && (
              <div className="col-span-3">
                <PropertiesPanel
                  component={selectedComponent}
                  onUpdate={handleComponentUpdate}
                />
              </div>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-80">
                <div className="text-sm font-medium text-gray-900">
                  {activeId.startsWith('component-') ? 'Nuevo componente' : 'Componente'}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

// Función para obtener propiedades por defecto según el tipo de componente
const getDefaultProps = (componentType: string) => {
  const defaultProps: { [key: string]: any } = {
    'hero-banner': {
      title: 'Bienvenido a Nuestro Despacho',
      subtitle: 'Servicios legales profesionales y confiables',
      backgroundImage: '/images/hero-bg.jpg',
      ctaText: 'Consultar Ahora',
      ctaLink: '/contact'
    },
    'service-cards': {
      title: 'Nuestros Servicios',
      services: [
        { title: 'Derecho Civil', description: 'Asesoría en casos civiles', icon: '⚖️' },
        { title: 'Derecho Laboral', description: 'Protección de derechos laborales', icon: '👥' },
        { title: 'Derecho Familiar', description: 'Divorcios y custodia', icon: '👨‍👩‍👧‍👦' }
      ]
    },
    'contact-form': {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte',
      fields: ['nombre', 'email', 'telefono', 'mensaje']
    },
    'testimonials': {
      title: 'Lo que dicen nuestros clientes',
      testimonials: [
        { name: 'María García', text: 'Excelente servicio profesional', rating: 5 },
        { name: 'Juan Pérez', text: 'Muy satisfecho con el resultado', rating: 5 }
      ]
    },
    'stats': {
      title: 'Nuestros Números',
      stats: [
        { label: 'Casos Exitosos', value: '500+' },
        { label: 'Años de Experiencia', value: '15' },
        { label: 'Clientes Satisfechos', value: '1000+' }
      ]
    },
    'text-block': {
      title: 'Sobre Nosotros',
      content: 'Somos un despacho de abogados comprometido con la excelencia y la justicia.',
      alignment: 'left',
      fontSize: 'medium'
    },
    'image-gallery': {
      title: 'Nuestras Instalaciones',
      columns: 3,
      showCaptions: true,
      images: [
        '/images/office-1.jpg',
        '/images/office-2.jpg',
        '/images/office-3.jpg'
      ]
    },
    'map': {
      title: 'Nuestra Ubicación',
      address: 'Calle Principal 123, Ciudad',
      latitude: 40.4168,
      longitude: -3.7038,
      zoom: 15
    },
    'divider': {
      type: 'solid',
      color: '#e5e7eb',
      thickness: 1
    },
    'spacer': {
      height: 40
    }
  };

  return defaultProps[componentType] || {};
};

export default HomeBuilder; 