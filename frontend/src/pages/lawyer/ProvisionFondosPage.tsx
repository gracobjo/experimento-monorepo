import React, { useState, useEffect } from 'react';
import { createProvision, linkProvisionToInvoice } from '../../api/provisionFondos';
import { getInvoices } from '../../api/invoices';
import api from '../../api/axios';

const ProvisionFondosPage = () => {
  const token = localStorage.getItem('token') || '';
  const [form, setForm] = useState({
    expedienteId: '',
    amount: '',
    date: '',
    description: '',
  });
  const [provisionId, setProvisionId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expedientes, setExpedientes] = useState<any[]>([]);

  // Cargar expedientes del abogado al montar
  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const res = await api.get('/cases', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpedientes(res.data);
      } catch {
        setExpedientes([]);
      }
    };
    fetchExpedientes();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExpedienteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, expedienteId: e.target.value });
  };

  const handleExpedienteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, expedienteId: e.target.value });
  };

  const handleCreateProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // Buscar el expediente seleccionado
      const expediente = expedientes.find((exp: any) => exp.id === form.expedienteId);
      const clientId = expediente?.client?.id || '';
      if (!clientId) {
        setError('No se pudo determinar el cliente del expediente seleccionado');
        setLoading(false);
        return;
      }
      const data = {
        clientId, // string
        expedienteId: form.expedienteId,
        amount: Number(form.amount),
        ...(form.date ? { date: form.date } : {}),
        description: form.description,
      };
      const res = await createProvision(data, token);
      setProvisionId(res.id);
      setSuccessMsg('Provisión creada. Ahora puedes vincularla a una factura.');
      // Cargar facturas para vincular
      const facturas = await getInvoices(token);
      setInvoices(facturas);
    } catch (err) {
      setError('Error al crear la provisión');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!provisionId || !selectedInvoice) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await linkProvisionToInvoice(provisionId, selectedInvoice, token);
      setSuccessMsg('Provisión vinculada correctamente a la factura.');
      setProvisionId(null);
      setSelectedInvoice('');
    } catch (err) {
      setError('Error al vincular la provisión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Crear Provisión de Fondos</h2>
      {successMsg && <div className="mb-2 text-green-700">{successMsg}</div>}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {!provisionId ? (
        <form onSubmit={handleCreateProvision} className="space-y-3">
          <div className="mb-2">
            <label className="block text-sm">Expediente (elige del desplegable o pega el ID)</label>
            <select
              className="border px-2 py-1 rounded w-full mb-1"
              value={form.expedienteId}
              onChange={handleExpedienteSelect}
            >
              <option value="">Selecciona un expediente</option>
              {expedientes.map((exp: any) => (
                <option key={exp.id} value={exp.id}>
                  {exp.title} - {exp.client?.user?.name || 'Sin cliente'} (ID: {exp.id})
                </option>
              ))}
            </select>
            <input
              className="border px-2 py-1 rounded w-full"
              placeholder="O pega el ID del expediente"
              value={form.expedienteId}
              onChange={handleExpedienteInput}
            />
          </div>
          {!form.date && (
            <div className="mb-2 text-xs text-gray-500">
              La fecha de la provisión se asignará automáticamente al crearla.
            </div>
          )}
          {form.date && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Fecha de provisión</label>
              <input value={form.date.slice(0,10)} readOnly className="border px-2 py-1 rounded w-full bg-gray-100" />
            </div>
          )}
          <div>
            <label htmlFor="amount" className="block text-sm">Importe</label>
            <input 
              id="amount"
              name="amount" 
              type="number" 
              value={form.amount} 
              onChange={handleChange} 
              className="border px-2 py-1 rounded w-full" 
              required 
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm">Descripción</label>
            <input 
              id="description"
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              className="border px-2 py-1 rounded w-full" 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Creando...' : 'Crear Provisión'}</button>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="invoice-select" className="block text-sm">Selecciona Factura para vincular</label>
            <select 
              id="invoice-select"
              value={selectedInvoice} 
              onChange={e => setSelectedInvoice(e.target.value)} 
              className="border px-2 py-1 rounded w-full"
            >
              <option value="">Selecciona una factura</option>
              {invoices.map((inv: any) => (
                <option key={inv.id} value={inv.id}>{inv.numeroFactura} - {inv.receptor?.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleLink} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading || !selectedInvoice}>{loading ? 'Vinculando...' : 'Vincular Provisión'}</button>
        </div>
      )}
    </div>
  );
};

export default ProvisionFondosPage; 