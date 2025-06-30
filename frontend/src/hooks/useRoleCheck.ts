import { useAuth } from '../context/AuthContext';

type Role = 'ADMIN' | 'ABOGADO' | 'CLIENTE';

interface UseRoleCheckReturn {
  hasPermission: (requiredRoles: Role[]) => boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  isClient: boolean;
  userRole: Role | null;
}

export const useRoleCheck = (): UseRoleCheckReturn => {
  const { user } = useAuth();

  const hasPermission = (requiredRoles: Role[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isLawyer = user?.role === 'ABOGADO';
  const isClient = user?.role === 'CLIENTE';

  return {
    hasPermission,
    isAdmin,
    isLawyer,
    isClient,
    userRole: user?.role || null,
  };
}; 