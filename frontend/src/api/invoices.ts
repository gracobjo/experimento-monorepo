import axios from './axios';

export async function getInvoices(token: string) {
  const res = await axios.get('/invoices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createInvoice(data: any, token: string) {
  const res = await axios.post('/invoices', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateInvoice(id: string, data: any, token: string) {
  const res = await axios.put(`/invoices/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function signInvoice(id: string, certContent: string, keyContent: string, token: string) {
  const res = await axios.post(`/invoices/${id}/sign`, { certContent, keyContent }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteInvoice(id: string, token: string) {
  const res = await axios.delete(`/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
} 