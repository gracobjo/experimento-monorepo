import axios from './axios';

export const createProvision = async (data: any, token: string) => {
  const res = await axios.post('/provision-fondos', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const linkProvisionToInvoice = async (provisionId: string, invoiceId: string, token: string) => {
  const res = await axios.patch('/provision-fondos/link-to-invoice', { provisionId, invoiceId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getPendingProvisions = async (token: string) => {
  const res = await axios.get('/provision-fondos', {
    params: { soloPendientes: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getProvisionesPendientesPorClienteExpediente = async (clientId: string, expedienteId: string, token: string) => {
  const res = await axios.get('/provision-fondos', {
    params: { clientId, expedienteId, soloPendientes: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Nueva función para obtener todas las provisiones de un cliente
export const getClientProvisions = async (clientId: string, token: string) => {
  const res = await axios.get('/provision-fondos', {
    params: { clientId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 