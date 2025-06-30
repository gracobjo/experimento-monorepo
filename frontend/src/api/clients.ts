import axios from './axios';

export async function getClients(token: string) {
  const res = await axios.get('/users/clients', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
} 