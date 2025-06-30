import React from 'react';
import { ComponentConfig } from './types';

interface ComponentRendererProps {
  component: ComponentConfig;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  console.log('ComponentRenderer - Rendering component:', component.type, component.props);

  const renderComponent = () => {
    switch (component.type) {
      case 'hero-banner':
        return <HeroBanner props={component.props} />;
      case 'service-cards':
        return <ServiceCards props={component.props} />;
      case 'contact-form':
        return <ContactForm props={component.props} />;
      case 'testimonials':
        return <Testimonials props={component.props} />;
      case 'stats':
        return <Stats props={component.props} />;
      case 'text-block':
        return <TextBlock props={component.props} />;
      case 'image-gallery':
        return <ImageGallery props={component.props} />;
      case 'map':
        return <Map props={component.props} />;
      case 'divider':
        return <Divider props={component.props} />;
      case 'spacer':
        return <Spacer props={component.props} />;
      default:
        return <div className="p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">Componente no reconocido: {component.type}</p>
        </div>;
    }
  };

  return (
    <div className="component-renderer">
      {renderComponent()}
    </div>
  );
};

// Componentes individuales
const HeroBanner: React.FC<{ props: any }> = ({ props }) => (
  <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 rounded-lg">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{props.title || 'Banner Principal'}</h1>
      <p className="text-xl mb-6 opacity-90">{props.subtitle || 'Subtítulo del banner'}</p>
      <a 
        href={props.ctaLink || '/contact'} 
        className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        {props.ctaText || 'Consultar Ahora'}
      </a>
    </div>
  </div>
);

const ServiceCards: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Nuestros Servicios'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(props.services || []).map((service: any, index: number) => (
        <div key={index} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
          <div className="text-4xl mb-3">{service.icon || '⚖️'}</div>
          <h3 className="text-lg font-semibold mb-2">{service.title || 'Servicio'}</h3>
          <p className="text-gray-600">{service.description || 'Descripción del servicio'}</p>
        </div>
      ))}
    </div>
  </div>
);

const ContactForm: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-4">{props.title || 'Contáctanos'}</h2>
    <p className="text-center text-gray-600 mb-6">{props.subtitle || 'Estamos aquí para ayudarte'}</p>
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Nombre"
        className="w-full p-3 border rounded-lg"
        disabled
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 border rounded-lg"
        disabled
      />
      <input
        type="tel"
        placeholder="Teléfono"
        className="w-full p-3 border rounded-lg"
        disabled
      />
      <textarea
        placeholder="Mensaje"
        rows={4}
        className="w-full p-3 border rounded-lg"
        disabled
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        disabled
      >
        Enviar Mensaje
      </button>
    </form>
  </div>
);

const Testimonials: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Lo que dicen nuestros clientes'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(props.testimonials || []).map((testimonial: any, index: number) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <div className="text-yellow-400 text-lg">★★★★★</div>
          </div>
          <p className="text-gray-700 mb-3">"{testimonial.text || 'Excelente servicio'}"</p>
          <p className="font-semibold text-gray-900">{testimonial.name || 'Cliente'}</p>
        </div>
      ))}
    </div>
  </div>
);

const Stats: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Nuestros Números'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(props.stats || []).map((stat: any, index: number) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value || '0'}</div>
          <div className="text-gray-600">{stat.label || 'Estadística'}</div>
        </div>
      ))}
    </div>
  </div>
);

const TextBlock: React.FC<{ props: any }> = ({ props }) => (
  <div className={`bg-white p-6 rounded-lg border text-${props.alignment || 'left'}`}>
    <h2 className="text-2xl font-bold mb-4">{props.title || 'Título del bloque'}</h2>
    <p className={`text-gray-700 ${props.fontSize === 'large' ? 'text-lg' : props.fontSize === 'small' ? 'text-sm' : 'text-base'}`}>
      {props.content || 'Contenido del bloque de texto. Aquí puedes escribir cualquier información relevante.'}
    </p>
  </div>
);

const ImageGallery: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Galería de Imágenes'}</h2>
    <div className={`grid grid-cols-${props.columns || 3} gap-4`}>
      {(props.images || []).map((image: string, index: number) => (
        <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">🖼️ Imagen {index + 1}</span>
        </div>
      ))}
    </div>
  </div>
);

const Map: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-4">{props.title || 'Nuestra Ubicación'}</h2>
    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-gray-600">{props.address || 'Dirección del despacho'}</p>
      </div>
    </div>
  </div>
);

const Divider: React.FC<{ props: any }> = ({ props }) => (
  <div className="flex items-center justify-center py-4">
    <div 
      className={`w-full h-${props.thickness || 1} bg-${props.color || 'gray-300'}`}
      style={{ backgroundColor: props.color || '#e5e7eb' }}
    />
  </div>
);

const Spacer: React.FC<{ props: any }> = ({ props }) => (
  <div style={{ height: `${props.height || 40}px` }} />
);

export default ComponentRenderer; 