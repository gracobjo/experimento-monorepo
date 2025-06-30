import React from 'react';

const TestComponent: React.FC = () => {
  console.log('TestComponent - Rendering');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎨 Home Builder - Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado del Sistema</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Componente de prueba cargado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>React funcionando</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Tailwind CSS cargado</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Próximos Pasos</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🔧</span>
              <span>Verificar que @dnd-kit esté funcionando</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🔧</span>
              <span>Probar drag & drop de componentes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🔧</span>
              <span>Conectar con el backend</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => console.log('Test button clicked')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Test Console Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestComponent; 