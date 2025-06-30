import React, { useState } from 'react';
import HomeBuilder from './HomeBuilder';

const HomeBuilderDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center p-8">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🎨 Home Builder
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistema de diseño drag & drop para crear páginas web profesionales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-4xl mb-4">🧩</div>
              <h3 className="text-lg font-semibold mb-2">Componentes Predefinidos</h3>
              <p className="text-gray-600">
                Biblioteca completa de componentes profesionales y personalizables
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Drag & Drop Intuitivo</h3>
              <p className="text-gray-600">
                Arrastra, suelta y reordena componentes con facilidad
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-lg font-semibold mb-2">Vista Previa en Tiempo Real</h3>
              <p className="text-gray-600">
                Ve los cambios instantáneamente mientras diseñas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Banner principal personalizable</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Tarjetas de servicios</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Formularios de contacto</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Testimonios de clientes</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Estadísticas y métricas</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Galerías de imágenes</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Mapas interactivos</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>Bloques de texto</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <button
              onClick={() => setShowDemo(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              🚀 Probar Home Builder
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Esta es una demostración del sistema Home Builder</p>
            <p>Los cambios no se guardarán en la base de datos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-blue-600 text-white p-4 text-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold">🎨 Home Builder - Modo Demo</h2>
          <button
            onClick={() => setShowDemo(false)}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
      <HomeBuilder />
    </div>
  );
};

export default HomeBuilderDemo; 