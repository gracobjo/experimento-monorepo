import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWidget from './ChatWidget';
import Notifications from './Notifications';
import { useState } from 'react';
import { useAppConfig } from '../hooks/useSiteConfig';

const Layout = () => {
  const { user, logout } = useAuth();
  const [openBilling, setOpenBilling] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isLawyer = user?.role === 'ABOGADO';
  const isClient = user?.role === 'CLIENTE';

  // Usar configuraciones dinámicas
  const {
    siteName,
    logoUrl,
    primaryColor,
    menuItems,
    menuOrientation,
    headerFixed,
    footerVisible,
    contactEmail,
    contactPhone,
    socialFacebook,
    socialTwitter,
    socialLinkedin,
    socialInstagram,
    loading: configLoading
  } = useAppConfig(user?.role || 'CLIENTE');

  // Estilos dinámicos basados en configuraciones
  const navStyle = {
    backgroundColor: primaryColor,
  };

  const headerClass = headerFixed ? 'fixed top-0 w-full z-50' : '';

  // Renderizar elementos del menú
  const renderMenuItem = (item: any) => {
    if (item.children && item.children.length > 0) {
      return (
        <div key={item.id || item.label} className="relative">
          <button
            className="hover:text-blue-200 px-2 py-1 rounded focus:outline-none flex items-center"
            onClick={() => setOpenBilling((v) => !v)}
            onBlur={() => setTimeout(() => setOpenBilling(false), 150)}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
            <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openBilling && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded shadow-lg z-50">
              {item.children.map((child: any) => (
                <Link
                  key={child.id || child.label}
                  to={child.url}
                  className="block px-4 py-2 hover:bg-blue-100"
                  onClick={() => setOpenBilling(false)}
                >
                  {child.icon && <span className="mr-2">{child.icon}</span>}
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id || item.label}
        to={item.url}
        className="hover:text-blue-200 flex items-center"
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
      >
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.label}
      </Link>
    );
  };

  // Menú por defecto si no hay configuración dinámica
  const getDefaultMenuItems = () => {
    if (isAdmin) {
      return [
        { label: 'Admin Dashboard', url: '/admin/dashboard', icon: '🏠' },
        { label: 'Usuarios', url: '/admin/users', icon: '👥' },
        { label: 'Expedientes', url: '/admin/cases', icon: '📋' },
        { label: 'Citas', url: '/admin/appointments', icon: '📅' },
        { label: 'Tareas', url: '/admin/tasks', icon: '✅' },
        { label: 'Documentos', url: '/admin/documents', icon: '📄' },
        { label: 'Reportes', url: '/admin/reports', icon: '📊' },
        { label: 'Home Builder', url: '/admin/home-builder', icon: '🎨' }
      ];
    } else if (isLawyer) {
      return [
        { label: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { label: 'Mis Expedientes', url: '/lawyer/cases', icon: '📋' },
        { label: 'Citas', url: '/lawyer/appointments', icon: '📅' },
        { label: 'Tareas', url: '/lawyer/tasks', icon: '✅' },
        { label: 'Chat', url: '/lawyer/chat', icon: '💬' },
        { label: 'Reportes', url: '/lawyer/reports', icon: '📊' },
        { 
          label: 'Facturación', 
          url: '#', 
          icon: '🧾',
          children: [
            { label: 'Provisión de Fondos', url: '/lawyer/provisiones', icon: '💰' },
            { label: 'Facturación Electrónica', url: '/lawyer/facturacion', icon: '📄' }
          ]
        }
      ];
    } else if (isClient) {
      return [
        { label: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { label: 'Mis Expedientes', url: '/client/cases', icon: '📋' },
        { label: 'Provisiones', url: '/client/provisiones', icon: '💰' },
        { label: 'Mis Citas', url: '/client/appointments', icon: '📅' },
        { label: 'Chat', url: '/client/chat', icon: '💬' }
      ];
    }
    return [];
  };

  const currentMenuItems = configLoading ? getDefaultMenuItems() : menuItems;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className={`text-white ${headerClass}`} style={navStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold flex items-center">
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt={siteName} 
                    className="h-8 w-auto mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {siteName}
              </Link>
            </div>
            <div className="flex items-center space-x-4 relative">
              {user ? (
                <>
                  {/* Menú dinámico */}
                  <div className={`flex items-center space-x-4 ${menuOrientation === 'vertical' ? 'flex-col' : ''}`}>
                    {currentMenuItems.map(renderMenuItem)}
                  </div>
                  
                  {/* Información del usuario */}
                  <span className="text-sm font-medium text-white bg-blue-900 rounded px-3 py-1">
                    {user.name} {user.email && <span className="text-gray-300">({user.email})</span>}
                  </span>
                  
                  {/* Botón de logout */}
                  <button
                    onClick={logout}
                    className="hover:text-blue-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-200">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="hover:text-blue-200">
                    Registro
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer para header fijo */}
      {headerFixed && <div className="h-16"></div>}

      {/* Notifications - Solo visible para usuarios autenticados */}
      {user && <Notifications />}

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      {footerVisible && (
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Información de contacto */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                <div className="space-y-2 text-sm">
                  {contactEmail && (
                    <p>📧 {contactEmail}</p>
                  )}
                  {contactPhone && (
                    <p>📞 {contactPhone}</p>
                  )}
                </div>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/privacidad" className="hover:text-gray-300 block">
                    Política de Privacidad
                  </Link>
                  <Link to="/terminos" className="hover:text-gray-300 block">
                    Términos de Servicio
                  </Link>
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
                <div className="flex space-x-4">
                  {socialFacebook && (
                    <a 
                      href={socialFacebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      📘 Facebook
                    </a>
                  )}
                  {socialTwitter && (
                    <a 
                      href={socialTwitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      🐦 Twitter
                    </a>
                  )}
                  {socialLinkedin && (
                    <a 
                      href={socialLinkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      💼 LinkedIn
                    </a>
                  )}
                  {socialInstagram && (
                    <a 
                      href={socialInstagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      📷 Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-700 text-center">
              <p>&copy; 2024 {siteName}. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Chat Widget - Solo visible para usuarios autenticados */}
      {user && <ChatWidget />}
    </div>
  );
};

export default Layout; 