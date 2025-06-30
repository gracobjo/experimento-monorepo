import axios from './axios';

export interface Parametro {
  id: string;
  clave: string;
  valor: string;
  etiqueta: string;
  tipo: string;
}

export async function getParametros(token: string): Promise<Parametro[]> {
  const res = await axios.get<Parametro[]>('/parametros', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createParametro(parametro: Omit<Parametro, 'id'>, token: string): Promise<Parametro> {
  const res = await axios.post<Parametro>('/parametros', parametro, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateParametro(id: string, data: Partial<Omit<Parametro, 'id' | 'clave'>>, token: string): Promise<Parametro> {
  const res = await axios.put<Parametro>(`/parametros/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteParametro(id: string, token: string): Promise<void> {
  await axios.delete(`/parametros/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
} 