import React from 'react';
import { useDraggable } from '@dnd-kit/core';

const ComponentLibrary: React.FC = () => {
  console.log('ComponentLibrary - Rendering');

  const components = [
    {
      type: 'hero-banner',
      name: 'Banner Principal',
      description: 'Banner destacado con título, subtítulo y botón CTA',
      icon: '🎯',
      category: 'Contenido Principal',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600'
    },
    {
      type: 'service-cards',
      name: 'Tarjetas de Servicios',
      description: 'Grid de servicios con iconos y descripciones',
      icon: '⚖️',
      category: 'Servicios',
      color: 'bg-gradient-to-r from-green-500 to-teal-600'
    },
    {
      type: 'contact-form',
      name: 'Formulario de Contacto',
      description: 'Formulario para que los clientes se pongan en contacto',
      icon: '📧',
      category: 'Contacto',
      color: 'bg-gradient-to-r from-orange-500 to-red-600'
    },
    {
      type: 'testimonials',
      name: 'Testimonios',
      description: 'Opiniones y comentarios de clientes satisfechos',
      icon: '💬',
      category: 'Social Proof',
      color: 'bg-gradient-to-r from-purple-500 to-pink-600'
    },
    {
      type: 'stats',
      name: 'Estadísticas',
      description: 'Números y métricas importantes del despacho',
      icon: '📊',
      category: 'Social Proof',
      color: 'bg-gradient-to-r from-indigo-500 to-blue-600'
    },
    {
      type: 'text-block',
      name: 'Bloque de Texto',
      description: 'Texto con título y contenido personalizable',
      icon: '📝',
      category: 'Contenido',
      color: 'bg-gradient-to-r from-gray-500 to-gray-700'
    },
    {
      type: 'image-gallery',
      name: 'Galería de Imágenes',
      description: 'Grid de imágenes con títulos opcionales',
      icon: '🖼️',
      category: 'Contenido',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    },
    {
      type: 'map',
      name: 'Mapa de Ubicación',
      description: 'Mapa interactivo con la ubicación del despacho',
      icon: '🗺️',
      category: 'Contacto',
      color: 'bg-gradient-to-r from-teal-500 to-green-600'
    },
    {
      type: 'divider',
      name: 'Separador',
      description: 'Línea divisoria para separar secciones',
      icon: '➖',
      category: 'Layout',
      color: 'bg-gradient-to-r from-gray-400 to-gray-600'
    },
    {
      type: 'spacer',
      name: 'Espaciador',
      description: 'Espacio vertical para separar elementos',
      icon: '⬜',
      category: 'Layout',
      color: 'bg-gradient-to-r from-gray-300 to-gray-500'
    }
  ];

  const categories = [...new Set(components.map(comp => comp.category))];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900">📚 Biblioteca de Componentes</h3>
        <p className="text-sm text-gray-600">Arrastra componentes al canvas</p>
      </div>
      
      <div className="p-4 max-h-[800px] overflow-y-auto">
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 px-2 py-1 bg-gray-100 rounded">
              {category}
            </h4>
            <div className="space-y-2">
              {components
                .filter(comp => comp.category === category)
                .map((component) => (
                  <DraggableComponent
                    key={component.type}
                    component={component}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente arrastrable individual
const DraggableComponent: React.FC<{ component: any }> = ({ component }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.type,
    data: {
      type: 'component-library',
      component
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  console.log(`DraggableComponent - ${component.type} - isDragging:`, isDragging);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`
        p-4 border rounded-lg cursor-move transition-all hover:shadow-md
        ${isDragging 
          ? 'bg-blue-50 border-blue-300 shadow-lg opacity-50 scale-105' 
          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${component.color}`}>
          {component.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-semibold text-gray-900 truncate">
            {component.name}
          </h5>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {component.description}
          </p>
        </div>
      </div>
      
      {/* Indicador de arrastre */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        ← Arrastra al canvas
      </div>
    </div>
  );
};

export default ComponentLibrary; 