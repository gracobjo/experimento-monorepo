import { useState, useEffect } from 'react';
import axios from '../api/axios';

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'image' | 'color' | 'boolean' | 'json';
  category: 'branding' | 'layout' | 'contact' | 'social' | 'general';
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id?: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  isExternal: boolean;
  parentId?: string;
  children?: MenuItem[];
}

interface MenuConfig {
  id: string;
  name: string;
  role: 'ADMIN' | 'ABOGADO' | 'CLIENTE';
  orientation: 'horizontal' | 'vertical';
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export const useSiteConfig = () => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicConfigs();
  }, []);

  const fetchPublicConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/site-config/public');
      const configsMap: Record<string, string> = {};
      response.data.forEach((config: SiteConfig) => {
        configsMap[config.key] = config.value;
      });
      setConfigs(configsMap);
    } catch (err) {
      console.error('Error fetching site configs:', err);
      setError('Error al cargar las configuraciones del sitio');
    } finally {
      setLoading(false);
    }
  };

  const getConfig = (key: string, defaultValue: string = ''): string => {
    return configs[key] || defaultValue;
  };

  const getBooleanConfig = (key: string, defaultValue: boolean = false): boolean => {
    return configs[key] === 'true' || defaultValue;
  };

  const getNumberConfig = (key: string, defaultValue: number = 0): number => {
    const value = configs[key];
    return value ? parseInt(value, 10) : defaultValue;
  };

  const updateConfig = async (key: string, value: string) => {
    try {
      await axios.patch(`/api/site-config/key/${key}`, { value });
      setConfigs(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (err) {
      console.error('Error updating config:', err);
      return false;
    }
  };

  return {
    configs,
    loading,
    error,
    getConfig,
    getBooleanConfig,
    getNumberConfig,
    updateConfig,
    refresh: fetchPublicConfigs
  };
};

export const useMenuConfig = (role: 'ADMIN' | 'ABOGADO' | 'CLIENTE') => {
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuConfig();
  }, [role]);

  const fetchMenuConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/menu-config/role/${role}`);
      setMenuConfig(response.data);
    } catch (err) {
      console.error('Error fetching menu config:', err);
      setError('Error al cargar la configuración del menú');
      setMenuConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItems = (): MenuItem[] => {
    if (!menuConfig) return [];
    return menuConfig.items
      .filter(item => item.isVisible)
      .sort((a, b) => a.order - b.order);
  };

  const getMenuOrientation = (): 'horizontal' | 'vertical' => {
    return menuConfig?.orientation || 'horizontal';
  };

  return {
    menuConfig,
    menuItems: getMenuItems(),
    orientation: getMenuOrientation(),
    loading,
    error,
    refresh: fetchMenuConfig
  };
};

// Hook combinado para obtener tanto configuraciones como menús
export const useAppConfig = (role: 'ADMIN' | 'ABOGADO' | 'CLIENTE') => {
  const siteConfig = useSiteConfig();
  const menuConfig = useMenuConfig(role);

  return {
    // Site config
    siteName: siteConfig.getConfig('site_name', 'Despacho Legal'),
    siteDescription: siteConfig.getConfig('site_description', 'Servicios legales profesionales'),
    logoUrl: siteConfig.getConfig('logo_url', '/images/logo.png'),
    faviconUrl: siteConfig.getConfig('favicon_url', '/images/favicon.ico'),
    primaryColor: siteConfig.getConfig('primary_color', '#1e40af'),
    secondaryColor: siteConfig.getConfig('secondary_color', '#3b82f6'),
    
    // Layout config
    sidebarPosition: siteConfig.getConfig('sidebar_position', 'left'),
    sidebarWidth: siteConfig.getConfig('sidebar_width', '250px'),
    headerFixed: siteConfig.getBooleanConfig('header_fixed', true),
    footerVisible: siteConfig.getBooleanConfig('footer_visible', true),
    
    // Contact config
    contactEmail: siteConfig.getConfig('contact_email', 'info@despacholegal.com'),
    contactPhone: siteConfig.getConfig('contact_phone', '+34 123 456 789'),
    contactAddress: siteConfig.getConfig('contact_address', 'Calle Principal 123, Madrid'),
    officeHours: siteConfig.getConfig('office_hours', 'Lunes a Viernes: 9:00 - 18:00'),
    
    // Social config
    socialFacebook: siteConfig.getConfig('social_facebook', ''),
    socialTwitter: siteConfig.getConfig('social_twitter', ''),
    socialLinkedin: siteConfig.getConfig('social_linkedin', ''),
    socialInstagram: siteConfig.getConfig('social_instagram', ''),
    
    // General config
    maintenanceMode: siteConfig.getBooleanConfig('maintenance_mode', false),
    defaultLanguage: siteConfig.getConfig('default_language', 'es'),
    timezone: siteConfig.getConfig('timezone', 'Europe/Madrid'),
    dateFormat: siteConfig.getConfig('date_format', 'DD/MM/YYYY'),
    
    // Menu config
    menuItems: menuConfig.menuItems,
    menuOrientation: menuConfig.orientation,
    
    // Loading states
    loading: siteConfig.loading || menuConfig.loading,
    error: siteConfig.error || menuConfig.error,
    
    // Methods
    updateSiteConfig: siteConfig.updateConfig,
    refreshSiteConfig: siteConfig.refresh,
    refreshMenuConfig: menuConfig.refresh
  };
}; 