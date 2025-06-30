import React, { useState, useEffect } from 'react';
import { ComponentConfig } from './types';

interface PropertiesPanelProps {
  component: ComponentConfig;
  onUpdate: (componentId: string, newProps: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, onUpdate }) => {
  const [localProps, setLocalProps] = useState(component.props);

  useEffect(() => {
    setLocalProps(component.props);
  }, [component]);

  console.log('PropertiesPanel - Rendering for component:', component.type);

  const handleChange = (key: string, value: any) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    onUpdate(component.id, newProps);
  };

  const handleArrayChange = (key: string, index: number, field: string, value: any) => {
    const array = [...(localProps[key] || [])];
    array[index] = { ...array[index], [field]: value };
    handleChange(key, array);
  };

  const addArrayItem = (key: string, defaultItem: any) => {
    const array = [...(localProps[key] || []), defaultItem];
    handleChange(key, array);
  };

  const removeArrayItem = (key: string, index: number) => {
    const array = [...(localProps[key] || [])];
    array.splice(index, 1);
    handleChange(key, array);
  };

  const renderPropertyEditor = () => {
    switch (component.type) {
      case 'hero-banner':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título Principal"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Despacho de Abogados García & Asociados"
            />
            <PropertyField
              label="Subtítulo"
              value={localProps.subtitle || ''}
              onChange={(value) => handleChange('subtitle', value)}
              type="textarea"
              placeholder="Ej: Más de 15 años de experiencia en servicios legales profesionales"
            />
            <PropertyField
              label="Texto del Botón"
              value={localProps.ctaText || ''}
              onChange={(value) => handleChange('ctaText', value)}
              type="text"
              placeholder="Ej: Consulta Gratuita"
            />
            <PropertyField
              label="Enlace del Botón"
              value={localProps.ctaLink || ''}
              onChange={(value) => handleChange('ctaLink', value)}
              type="text"
              placeholder="Ej: /contacto o https://wa.me/34612345678"
            />
          </div>
        );

      case 'service-cards':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título de la Sección"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Nuestros Servicios Legales"
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Servicios</label>
                <button
                  onClick={() => addArrayItem('services', { icon: '⚖️', title: 'Nuevo Servicio', description: 'Descripción del servicio' })}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Agregar
                </button>
              </div>
              
              {(localProps.services || []).map((service: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Servicio {index + 1}</span>
                    <button
                      onClick={() => removeArrayItem('services', index)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  <PropertyField
                    label="Icono (emoji)"
                    value={service.icon || ''}
                    onChange={(value) => handleArrayChange('services', index, 'icon', value)}
                    type="text"
                    placeholder="Ej: ⚖️ 👥 🏢"
                  />
                  <PropertyField
                    label="Título del Servicio"
                    value={service.title || ''}
                    onChange={(value) => handleArrayChange('services', index, 'title', value)}
                    type="text"
                    placeholder="Ej: Derecho Civil"
                  />
                  <PropertyField
                    label="Descripción"
                    value={service.description || ''}
                    onChange={(value) => handleArrayChange('services', index, 'description', value)}
                    type="textarea"
                    placeholder="Ej: Asesoría especializada en casos civiles"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact-form':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título del Formulario"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Solicita tu Consulta Gratuita"
            />
            <PropertyField
              label="Subtítulo"
              value={localProps.subtitle || ''}
              onChange={(value) => handleChange('subtitle', value)}
              type="textarea"
              placeholder="Ej: Nuestros abogados especialistas están listos para ayudarte"
            />
            <PropertyField
              label="Texto del Botón"
              value={localProps.submitText || ''}
              onChange={(value) => handleChange('submitText', value)}
              type="text"
              placeholder="Ej: Enviar Consulta"
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título de la Sección"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Lo que dicen nuestros clientes"
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Testimonios</label>
                <button
                  onClick={() => addArrayItem('testimonials', { name: 'Cliente', text: 'Excelente servicio', rating: 5 })}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Agregar
                </button>
              </div>
              
              {(localProps.testimonials || []).map((testimonial: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Testimonio {index + 1}</span>
                    <button
                      onClick={() => removeArrayItem('testimonials', index)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  <PropertyField
                    label="Nombre del Cliente"
                    value={testimonial.name || ''}
                    onChange={(value) => handleArrayChange('testimonials', index, 'name', value)}
                    type="text"
                    placeholder="Ej: María García"
                  />
                  <PropertyField
                    label="Testimonio"
                    value={testimonial.text || ''}
                    onChange={(value) => handleArrayChange('testimonials', index, 'text', value)}
                    type="textarea"
                    placeholder="Ej: Excelente servicio profesional..."
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título de la Sección"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Nuestros Números"
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Estadísticas</label>
                <button
                  onClick={() => addArrayItem('stats', { value: '0', label: 'Nueva Estadística' })}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Agregar
                </button>
              </div>
              
              {(localProps.stats || []).map((stat: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Estadística {index + 1}</span>
                    <button
                      onClick={() => removeArrayItem('stats', index)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  <PropertyField
                    label="Valor"
                    value={stat.value || ''}
                    onChange={(value) => handleArrayChange('stats', index, 'value', value)}
                    type="text"
                    placeholder="Ej: 500+"
                  />
                  <PropertyField
                    label="Etiqueta"
                    value={stat.label || ''}
                    onChange={(value) => handleArrayChange('stats', index, 'label', value)}
                    type="text"
                    placeholder="Ej: Casos Exitosos"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'text-block':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Sobre Nosotros"
            />
            <PropertyField
              label="Contenido"
              value={localProps.content || ''}
              onChange={(value) => handleChange('content', value)}
              type="textarea"
              placeholder="Ej: Somos un despacho de abogados comprometido..."
            />
            <PropertySelect
              label="Alineación del Texto"
              value={localProps.alignment || 'left'}
              onChange={(value) => handleChange('alignment', value)}
              options={[
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Derecha' }
              ]}
            />
            <PropertySelect
              label="Tamaño de Fuente"
              value={localProps.fontSize || 'medium'}
              onChange={(value) => handleChange('fontSize', value)}
              options={[
                { value: 'small', label: 'Pequeño' },
                { value: 'medium', label: 'Mediano' },
                { value: 'large', label: 'Grande' }
              ]}
            />
          </div>
        );

      case 'image-gallery':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título de la Galería"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Nuestras Instalaciones"
            />
            <PropertySelect
              label="Número de Columnas"
              value={localProps.columns || 3}
              onChange={(value) => handleChange('columns', parseInt(value))}
              options={[
                { value: 2, label: '2 columnas' },
                { value: 3, label: '3 columnas' },
                { value: 4, label: '4 columnas' }
              ]}
            />
          </div>
        );

      case 'map':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Título"
              value={localProps.title || ''}
              onChange={(value) => handleChange('title', value)}
              type="text"
              placeholder="Ej: Nuestra Ubicación"
            />
            <PropertyField
              label="Dirección"
              value={localProps.address || ''}
              onChange={(value) => handleChange('address', value)}
              type="text"
              placeholder="Ej: Calle Principal 123, Madrid"
            />
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            <PropertySelect
              label="Tipo de Línea"
              value={localProps.type || 'solid'}
              onChange={(value) => handleChange('type', value)}
              options={[
                { value: 'solid', label: 'Sólida' },
                { value: 'dashed', label: 'Punteada' },
                { value: 'dotted', label: 'Puntos' }
              ]}
            />
            <PropertyField
              label="Color"
              value={localProps.color || '#e5e7eb'}
              onChange={(value) => handleChange('color', value)}
              type="color"
            />
            <PropertyField
              label="Grosor (px)"
              value={localProps.thickness || 1}
              onChange={(value) => handleChange('thickness', parseInt(value))}
              type="number"
            />
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-4">
            <PropertyField
              label="Altura (px)"
              value={localProps.height || 40}
              onChange={(value) => handleChange('height', parseInt(value))}
              type="number"
            />
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-center py-4">
            No hay propiedades editables para este componente
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-semibold text-gray-900">⚙️ Propiedades</h3>
        <p className="text-sm text-gray-600">
          {getComponentTypeLabel(component.type)}
        </p>
      </div>
      
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {renderPropertyEditor()}
      </div>
    </div>
  );
};

// Componente para campos de propiedades
const PropertyField: React.FC<{
  label: string;
  value: any;
  onChange: (value: any) => void;
  type: 'text' | 'textarea' | 'number' | 'color';
  placeholder?: string;
}> = ({ label, value, onChange, type, placeholder }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

// Componente para selectores de propiedades
const PropertySelect: React.FC<{
  label: string;
  value: any;
  onChange: (value: any) => void;
  options: { value: any; label: string }[];
}> = ({ label, value, onChange, options }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Función para obtener etiqueta legible del tipo de componente
const getComponentTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    'hero-banner': 'Banner Principal',
    'service-cards': 'Tarjetas de Servicios',
    'contact-form': 'Formulario de Contacto',
    'testimonials': 'Testimonios',
    'stats': 'Estadísticas',
    'text-block': 'Bloque de Texto',
    'image-gallery': 'Galería de Imágenes',
    'map': 'Mapa de Ubicación',
    'divider': 'Separador',
    'spacer': 'Espaciador'
  };
  
  return labels[type] || type;
};

export default PropertiesPanel; 