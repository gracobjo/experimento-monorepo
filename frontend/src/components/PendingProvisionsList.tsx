import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

interface PendingProvisionsListProps {
  clientId?: string;
  expedienteId?: string;
}

const PendingProvisionsList: React.FC<PendingProvisionsListProps> = ({ clientId, expedienteId }) => {
  const token = localStorage.getItem('token');
  const [provisions, setProvisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvisions = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/provision-fondos?soloPendientes=true';
        if (clientId) url += `&clientId=${clientId}`;
        if (expedienteId) url += `&expedienteId=${expedienteId}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProvisions(res.data);
      } catch (err) {
        setError('Error al cargar las provisiones pendientes');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProvisions();
  }, [token, clientId, expedienteId]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-bold mb-2">Provisiones de Fondos Pendientes</h3>
      {loading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : provisions.length === 0 ? (
        <div className="text-gray-500">No hay provisiones pendientes.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {provisions.map((prov) => (
            <li key={prov.id} className="py-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{prov.amount || prov.importe}€</span> - {prov.description || 'Sin descripción'}
                  <div className="text-xs text-gray-500">Expediente: {prov.expedienteId}</div>
                </div>
                <div className="text-xs text-gray-400">{prov.date ? prov.date.slice(0, 10) : ''}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingProvisionsList; 