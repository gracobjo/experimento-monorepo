import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
}

const PlaceholderPage = ({ title, description, icon = "🚧" }: PlaceholderPageProps) => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8">
          {description || "Esta funcionalidad está en desarrollo y estará disponible pronto."}
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Próximas funcionalidades:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Interfaz completa y funcional</li>
              <li>• Integración con backend</li>
              <li>• Gestión de datos en tiempo real</li>
              <li>• Reportes y estadísticas</li>
            </ul>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage; 