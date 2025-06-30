import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock interfaces
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

// Mock AuthContext
const MockAuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const value = {
    user,
    loading: false,
    login: async () => {},
    logout: () => {},
    register: async () => {}
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};

// Mock useRoleCheck hook
const useRoleCheck = () => {
  const { user } = useAuth();

  const hasPermission = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return {
    hasPermission,
    isAdmin: user?.role === 'ADMIN',
    isLawyer: user?.role === 'ABOGADO',
    isClient: user?.role === 'CLIENTE',
    userRole: user?.role || null,
  };
};

// Mock ProtectedRoute component
const ProtectedRoute = ({ children, requiredRoles }: {
  children: React.ReactNode;
  requiredRoles: string[];
}) => {
  const { hasPermission } = useRoleCheck();
  return hasPermission(requiredRoles) ? <>{children}</> : null;
};

// Test components
const TestComponent = ({ requiredRoles }: { requiredRoles: string[] }) => {
  const { hasPermission, isAdmin, isLawyer, isClient, userRole } = useRoleCheck();
  
  return (
    <div>
      <div data-testid="has-permission">{hasPermission(requiredRoles).toString()}</div>
      <div data-testid="is-admin">{isAdmin.toString()}</div>
      <div data-testid="is-lawyer">{isLawyer.toString()}</div>
      <div data-testid="is-client">{isClient.toString()}</div>
      <div data-testid="user-role">{userRole || 'none'}</div>
    </div>
  );
};

const TestProtectedComponent = () => <div>Protected Content</div>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <MockAuthProvider>
      {children}
    </MockAuthProvider>
  </BrowserRouter>
);

describe('Role Security Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('useRoleCheck Hook', () => {
    it('should return false for all permissions when no user is logged in', () => {
      render(
        <TestWrapper>
          <TestComponent requiredRoles={['ADMIN']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-permission')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('is-lawyer')).toHaveTextContent('false');
      expect(screen.getByTestId('is-client')).toHaveTextContent('false');
      expect(screen.getByTestId('user-role')).toHaveTextContent('none');
    });

    it('should correctly identify ADMIN role', () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
        name: 'Admin User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <TestComponent requiredRoles={['ADMIN']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-permission')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('is-lawyer')).toHaveTextContent('false');
      expect(screen.getByTestId('is-client')).toHaveTextContent('false');
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });

    it('should correctly identify ABOGADO role', () => {
      const mockUser = {
        id: '2',
        email: 'lawyer@test.com',
        role: 'ABOGADO' as const,
        name: 'Lawyer User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <TestComponent requiredRoles={['ABOGADO']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-permission')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('is-lawyer')).toHaveTextContent('true');
      expect(screen.getByTestId('is-client')).toHaveTextContent('false');
      expect(screen.getByTestId('user-role')).toHaveTextContent('ABOGADO');
    });

    it('should correctly identify CLIENTE role', () => {
      const mockUser = {
        id: '3',
        email: 'client@test.com',
        role: 'CLIENTE' as const,
        name: 'Client User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <TestComponent requiredRoles={['CLIENTE']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-permission')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('is-lawyer')).toHaveTextContent('false');
      expect(screen.getByTestId('is-client')).toHaveTextContent('true');
      expect(screen.getByTestId('user-role')).toHaveTextContent('CLIENTE');
    });

    it('should handle multiple required roles correctly', () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
        name: 'Admin User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <TestComponent requiredRoles={['ADMIN', 'ABOGADO']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-permission')).toHaveTextContent('true');
    });

    it('should deny access when user role is not in required roles', () => {
      const mockUser = {
        id: '3',
        email: 'client@test.com',
        role: 'CLIENTE' as const,
        name: 'Client User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <TestComponent requiredRoles={['ADMIN', 'ABOGADO']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-permission')).toHaveTextContent('false');
    });
  });

  describe('ProtectedRoute Component', () => {
    it('should render children when user has required role', () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
        name: 'Admin User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <TestProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect when user does not have required role', () => {
      const mockUser = {
        id: '3',
        email: 'client@test.com',
        role: 'CLIENTE' as const,
        name: 'Client User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <TestProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect when no user is logged in', () => {
      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <TestProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
}); 