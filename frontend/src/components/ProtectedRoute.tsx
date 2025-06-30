import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleCheck } from '../hooks/useRoleCheck';

type Role = 'ADMIN' | 'ABOGADO' | 'CLIENTE';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: Role[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallbackPath = '/unauthorized'
}) => {
  const { hasPermission, userRole } = useRoleCheck();

  if (!hasPermission(requiredRoles)) {
    console.warn(`Access denied: User role ${userRole} does not have permission for roles ${requiredRoles.join(', ')}`);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}; 