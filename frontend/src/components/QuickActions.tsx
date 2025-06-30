import React, { useState } from 'react';
import api from '../api/axios';

interface QuickActionsProps {
  expedienteId?: string;
  expedienteData?: any; // opcional: para pasar el objeto completo y extraer clientId/lawyerId
  onAppointmentCreated?: (data: any) => void;
  onNoteAdded?: (data: any) => void;
  onMessageSent?: (data: any) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ expedienteId, expedienteData, onAppointmentCreated, onNoteAdded, onMessageSent }) => {
  const [modal, setModal] = useState<'cita' | 'nota' | 'mensaje' | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const closeModal = () => {
    setModal(null);
    setForm({});
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (modal === 'cita') {
      // Obtener clientId y lawyerId del expedienteData si está disponible
      let clientId = expedienteData?.client?.id;
      let lawyerId = expedienteData?.lawyer?.id;
      // Si no, pedirlos como props o no permitir continuar
      if (!clientId || !lawyerId) {
        setError('No se pudo obtener el cliente o abogado del expediente.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const payload = {
          clientId,
          lawyerId,
          date: form.datetime,
          location: form.location,
          notes: form.notes,
        };
        const response = await api.post('/appointments', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Cita programada con éxito');
        if (onAppointmentCreated) onAppointmentCreated(response.data);
        setTimeout(closeModal, 1200);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al programar la cita');
      } finally {
        setLoading(false);
      }
      return;
    }
    // Simulación para las otras acciones
    setTimeout(() => {
      setLoading(false);
      setSuccess('Acción realizada con éxito');
      if (modal === 'nota' && onNoteAdded) onNoteAdded(form);
      if (modal === 'mensaje' && onMessageSent) onMessageSent(form);
      setTimeout(closeModal, 1000);
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 my-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setModal('cita')}
      >
        Programar Cita
      </button>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() => setModal('nota')}
      >
        Agregar Nota
      </button>
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        onClick={() => setModal('mensaje')}
      >
        Enviar Mensaje
      </button>

      {/* Modal Programar Cita */}
      {modal === 'cita' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={closeModal}>×</button>
            <h2 className="text-xl font-bold mb-4">Programar Cita</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="expedienteId" value={expedienteId || ''} />
              <div>
                <label htmlFor="datetime" className="block text-sm font-medium mb-1">Fecha y hora</label>
                <input
                  id="datetime"
                  type="datetime-local"
                  name="datetime"
                  required
                  className="w-full border rounded px-2 py-1"
                  onChange={handleChange}
                  title="Seleccione la fecha y hora"
                  placeholder="Seleccione la fecha y hora"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Lugar</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  required
                  className="w-full border rounded px-2 py-1"
                  onChange={handleChange}
                  title="Ingrese el lugar"
                  placeholder="Ingrese el lugar"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="w-full border rounded px-2 py-1"
                  onChange={handleChange}
                  title="Ingrese notas adicionales"
                  placeholder="Ingrese notas adicionales"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Nota */}
      {modal === 'nota' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={closeModal}>×</button>
            <h2 className="text-xl font-bold mb-4">Agregar Nota</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="expedienteId" value={expedienteId || ''} />
              <div>
                <label htmlFor="nota-textarea" className="block text-sm font-medium mb-1">Nota</label>
                <textarea
                  id="nota-textarea"
                  name="note"
                  required
                  className="w-full border rounded px-2 py-1"
                  onChange={handleChange}
                  title="Ingrese la nota"
                  placeholder="Ingrese la nota"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enviar Mensaje */}
      {modal === 'mensaje' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={closeModal}>×</button>
            <h2 className="text-xl font-bold mb-4">Enviar Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="expedienteId" value={expedienteId || ''} />
              <div>
                <label htmlFor="mensaje-textarea" className="block text-sm font-medium mb-1">Mensaje</label>
                <textarea
                  id="mensaje-textarea"
                  name="message"
                  required
                  className="w-full border rounded px-2 py-1"
                  onChange={handleChange}
                  title="Ingrese el mensaje a enviar"
                  placeholder="Escriba su mensaje aquí"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions; 