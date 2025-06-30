import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getRedirectPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ABOGADO':
        return '/lawyer/cases';
      case 'CLIENTE':
        return '/client/cases';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso No Autorizado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              Tu rol actual: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link
            to={getRedirectPath()}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al Dashboard
          </Link>
          
          <Link
            to="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 