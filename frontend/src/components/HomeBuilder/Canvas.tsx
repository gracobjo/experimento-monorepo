import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentConfig, LayoutConfig } from './types';
import ComponentRenderer from './ComponentRenderer';

interface CanvasProps {
  layout: LayoutConfig;
  onComponentSelect: (component: ComponentConfig) => void;
  onComponentDelete: (componentId: string) => void;
  selectedComponent: ComponentConfig | null;
  isPreviewMode: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  layout,
  onComponentSelect,
  onComponentDelete,
  selectedComponent,
  isPreviewMode
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  console.log('Canvas - Rendering, components:', layout.components.length);
  console.log('Canvas - isPreviewMode:', isPreviewMode);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="text-lg font-semibold text-gray-900">
          {isPreviewMode ? '👁️ Vista Previa' : '🎨 Canvas de Diseño'}
        </h3>
        <p className="text-sm text-gray-600">
          {isPreviewMode 
            ? 'Vista previa de la página principal' 
            : 'Arrastra componentes aquí para diseñar la página'
          }
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={`
          min-h-[600px] p-6 transition-all
          ${isOver 
            ? 'bg-blue-50 border-2 border-dashed border-blue-400' 
            : 'bg-gray-50 border-2 border-dashed border-gray-300'
          }
          ${isPreviewMode ? 'bg-white' : ''}
        `}
      >
        {layout.components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Canvas Vacío
            </h3>
            <p className="text-gray-500 mb-4 max-w-md">
              {isPreviewMode 
                ? 'No hay componentes para mostrar en la vista previa'
                : 'Arrastra componentes desde la biblioteca para comenzar a diseñar'
              }
            </p>
            {!isPreviewMode && (
              <div className="text-sm text-gray-400">
                💡 Tip: Comienza con un Banner Principal
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {layout.components.map((component, index) => (
              <CanvasComponent
                key={component.id}
                component={component}
                index={index}
                onSelect={onComponentSelect}
                onDelete={onComponentDelete}
                isSelected={selectedComponent?.id === component.id}
                isPreviewMode={isPreviewMode}
              />
            ))}
          </div>
        )}

        {/* Indicador de zona de drop */}
        {isOver && !isPreviewMode && (
          <div className="text-center py-8 text-blue-600 font-medium">
            ✨ Suelta aquí para agregar el componente
          </div>
        )}
      </div>
    </div>
  );
};

// Componente individual en el canvas
const CanvasComponent: React.FC<{
  component: ComponentConfig;
  index: number;
  onSelect: (component: ComponentConfig) => void;
  onDelete: (componentId: string) => void;
  isSelected: boolean;
  isPreviewMode: boolean;
}> = ({ component, index, onSelect, onDelete, isSelected, isPreviewMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    data: {
      type: 'canvas-component',
      component,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  console.log(`CanvasComponent - ${component.type} - isSelected:`, isSelected);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative group transition-all
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isSelected && !isPreviewMode 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'hover:ring-1 hover:ring-gray-300'
        }
      `}
    >
      {/* Controles del componente (solo en modo edición) */}
      {!isPreviewMode && (
        <div className="absolute -top-2 -left-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(component);
            }}
            className="bg-blue-500 text-white p-1 rounded-full text-xs hover:bg-blue-600 transition-colors"
            title="Editar componente"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            className="bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors"
            title="Eliminar componente"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Indicador de orden */}
      {!isPreviewMode && (
        <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
          {index + 1}
        </div>
      )}

      {/* Contenido del componente */}
      <div 
        className={`
          ${isPreviewMode ? '' : 'cursor-move'}
          ${isSelected && !isPreviewMode ? 'bg-blue-50' : ''}
        `}
        onClick={() => !isPreviewMode && onSelect(component)}
      >
        <ComponentRenderer component={component} />
      </div>

      {/* Borde de selección */}
      {isSelected && !isPreviewMode && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none rounded-lg" />
      )}
    </div>
  );
};

export default Canvas; 