import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InvoicesPage from './InvoicesPage';
import ProvisionFondosPage from './ProvisionFondosPage';
import PendingProvisionsList from '../../components/PendingProvisionsList';
// ...otros imports...

const DashboardLawyer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // ...otros hooks y lógica...
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Bienvenido, {user?.name}{user?.email && ` (${user.email})`}
      </h1>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 flex flex-col items-start">
          <h3 className="font-semibold text-lg mb-1">Mis Casos</h3>
          <p className="text-gray-600 mb-2">Gestionar casos asignados</p>
          {/* Aquí puedes poner un botón o enlace */}
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-start">
          <h3 className="font-semibold text-lg mb-1">Mis Clientes</h3>
          <p className="text-gray-600 mb-2">Ver información de clientes</p>
          {/* Aquí puedes poner un botón o enlace */}
        </div>
        {/* Acceso directo a Provisión de Fondos (izquierda) */}
        <div className="bg-blue-50 rounded shadow p-4 flex flex-col items-start">
          <h3 className="font-semibold text-lg mb-1">Provisión de Fondos</h3>
          <p className="text-gray-600 mb-2">Gestiona provisiones de fondos</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/lawyer/dashboard/provisiones')}
          >
            Ir a Provisiones
          </button>
        </div>
        {/* Acceso directo a Facturación Electrónica (derecha) */}
        <div className="bg-green-50 rounded shadow p-4 flex flex-col items-start">
          <h3 className="font-semibold text-lg mb-1">Facturación Electrónica</h3>
          <p className="text-gray-600 mb-2">Gestiona y firma tus facturas</p>
          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => navigate('/lawyer/dashboard/facturacion')}
          >
            Ir a Facturación
          </button>
        </div>
      </div>

      {/* Aquí puedes dejar el resto del dashboard, como el widget de provisiones pendientes */}
      <section className="bg-white rounded shadow p-4">
        <PendingProvisionsList />
      </section>
    </div>
  );
};

export default DashboardLawyer; 