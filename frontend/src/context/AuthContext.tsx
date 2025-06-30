import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom'; // Añade este import

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'ABOGADO' | 'CLIENTE';
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; name: string; role: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /* const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }; */

  /* const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw new Error('Error en el inicio de sesión');
    }
  }; */

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Verifica la estructura del usuario
        if (response.data && response.data.role) {
          setUser(response.data);
        } else {
          throw new Error('Datos de usuario incompletos');
        }
      }
    } catch (error) {
      console.error("Error en checkAuth:", error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      // Guarda TODOS los datos del usuario incluyendo el role
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role // Asegúrate que esto viene del backend
      });
      
      // Redirige según el rol
      if (user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard'; // Asegúrate que esta ruta existe
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: unknown) {
      console.error("Error completo en login:", (error as any)?.response?.data || (error as Error)?.message);
      throw new Error((error as any)?.response?.data?.message || 'Error en el inicio de sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw new Error('Error en el registro');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 