import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    pendingAppointments: 0,
    recentDocuments: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const promises: Promise<any>[] = [];
        
        // Expedientes
        promises.push(axios.get('/api/cases/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }));
        
        // Citas
        promises.push(axios.get('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        }));
        
        // Documentos
        promises.push(axios.get('/api/documents/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }));

        // Usuarios (solo para admin)
        if (user?.role === 'ADMIN') {
          promises.push(axios.get('/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          }));
        }

        // Actividad reciente real
        promises.push(axios.get('/api/cases/recent', {
          headers: { Authorization: `Bearer ${token}` }
        }));

        // Actividad reciente completa para abogados
        if (user?.role === 'ABOGADO') {
          promises.push(axios.get('/api/cases/recent-activities', {
            headers: { Authorization: `Bearer ${token}` }
          }));
        }

        const results = await Promise.all(promises);
        
        // Casos
        const casesStats = results[0].data;
        // Citas
        const appointments = results[1].data;
        // Documentos
        const documentsStats = results[2].data;
        // Usuarios (solo para admin)
        const users = user?.role === 'ADMIN' ? results[3]?.data : [];
        // Actividad reciente
        const recentCases = results[user?.role === 'ADMIN' ? 4 : 3]?.data || [];
        // Actividad reciente completa para abogados
        const recentActivities = user?.role === 'ABOGADO' ? results[4]?.data : null;

        // Calcular valores según el rol
        let totalCases = 0, activeCases = 0, pendingAppointments = 0, recentDocuments = 0, totalUsers = 0;
        
        if (user?.role === 'ADMIN' || user?.role === 'ABOGADO' || user?.role === 'CLIENTE') {
          totalCases = casesStats.total || 0;
          activeCases = (casesStats.abiertos || 0) + (casesStats.enProceso || 0);
        }
        
        // Citas: próximas (futuras)
        if (Array.isArray(appointments)) {
          const now = new Date();
          if (user?.role === 'ADMIN') {
            pendingAppointments = appointments.filter((a: any) => new Date(a.date) > now).length;
          } else if (user?.role === 'ABOGADO' || user?.role === 'CLIENTE') {
            // Citas de hoy
            pendingAppointments = appointments.filter((a: any) => {
              const d = new Date(a.date);
              return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length;
          }
        }
        
        // Documentos
        if (documentsStats && typeof documentsStats.total === 'number') {
          recentDocuments = documentsStats.total;
        }
        
        // Usuarios (solo para admin)
        if (user?.role === 'ADMIN' && Array.isArray(users)) {
          totalUsers = users.length;
        }

      setStats({
          totalCases,
          activeCases,
          pendingAppointments,
          recentDocuments,
          totalUsers
        });

        // Generar actividad reciente basada en datos reales
        const activity: Array<{
          action: string; 
          time: string; 
          type: string;
          id?: string;
          link?: string;
          entityType?: string;
        }> = [];
        
        // Para abogados, usar la actividad reciente completa
        if (user?.role === 'ABOGADO' && recentActivities) {
          // Agregar expedientes recientes
          if (recentActivities.cases && recentActivities.cases.length > 0) {
            recentActivities.cases.forEach((caseItem: any) => {
              activity.push({
                action: `Expediente: ${caseItem.title}`,
                time: new Date(caseItem.createdAt).toLocaleDateString(),
                type: 'case',
                id: caseItem.id,
                link: `/lawyer/cases/${caseItem.id}`,
                entityType: 'case'
              });
            });
          }

          // Agregar tareas recientes
          if (recentActivities.tasks && recentActivities.tasks.length > 0) {
            recentActivities.tasks.forEach((task: any) => {
              const clientName = task.client?.user?.name || 'Cliente';
              const expedienteTitle = task.expediente?.title ? ` - ${task.expediente.title}` : '';
              activity.push({
                action: `Tarea: ${task.title} (${clientName}${expedienteTitle})`,
                time: new Date(task.createdAt).toLocaleDateString(),
                type: 'task',
                id: task.id,
                link: `/lawyer/tasks`,
                entityType: 'task'
              });
            });
          }

          // Agregar citas recientes
          if (recentActivities.appointments && recentActivities.appointments.length > 0) {
            recentActivities.appointments.forEach((appointment: any) => {
              const clientName = appointment.client?.user?.name || 'Cliente';
              activity.push({
                action: `Cita con ${clientName} - ${new Date(appointment.date).toLocaleDateString()}`,
                time: new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'appointment',
                id: appointment.id,
                link: `/lawyer/appointments`,
                entityType: 'appointment'
              });
            });
          }

          // Agregar provisiones de fondos recientes
          if (recentActivities.provisions && recentActivities.provisions.length > 0) {
            recentActivities.provisions.forEach((provision: any) => {
              const clientName = provision.client?.user?.name || 'Cliente';
              const expedienteTitle = provision.expediente?.title ? ` - ${provision.expediente.title}` : '';
              activity.push({
                action: `Provisión de fondos: ${provision.amount}€ (${clientName}${expedienteTitle})`,
                time: new Date(provision.createdAt).toLocaleDateString(),
                type: 'provision',
                id: provision.id,
                link: `/lawyer/provisiones`,
                entityType: 'provision'
              });
            });
          }
        } else if (user?.role === 'CLIENTE') {
          // Actividad reciente mejorada para clientes
          // Agregar expedientes recientes
          if (Array.isArray(recentCases) && recentCases.length > 0) {
            recentCases.slice(0, 2).forEach((caseItem: any) => {
              activity.push({
                action: `Expediente: ${caseItem.title}`,
                time: new Date(caseItem.createdAt).toLocaleDateString(),
                type: 'case',
                id: caseItem.id,
                link: `/client/cases/${caseItem.id}`,
                entityType: 'case'
              });
            });
          }
          
          // Agregar citas próximas
          if (Array.isArray(appointments) && appointments.length > 0) {
            const upcomingAppointments = appointments
              .filter((a: any) => new Date(a.date) > new Date())
              .slice(0, 2);
            
            upcomingAppointments.forEach((appointment: any) => {
              const lawyerName = appointment.lawyer?.name || 'Abogado';
              activity.push({
                action: `Cita con ${lawyerName} - ${new Date(appointment.date).toLocaleDateString()}`,
                time: new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'appointment',
                id: appointment.id,
                link: `/client/appointments`,
                entityType: 'appointment'
              });
            });
          }
          
          // Agregar documentos recientes (si hay datos)
          if (documentsStats && documentsStats.total > 0) {
            activity.push({
              action: `${documentsStats.total} documentos disponibles`,
              time: 'Total',
              type: 'document',
              link: `/client/documents`,
              entityType: 'document'
            });
          }
          
          // Agregar información de provisiones de fondos
          if (stats.totalCases > 0) {
            activity.push({
              action: `Ver mis provisiones de fondos`,
              time: 'Acceso directo',
              type: 'provision',
              link: `/client/provisiones`,
              entityType: 'provision'
            });
          }
        } else {
          // Agregar expedientes recientes
          if (Array.isArray(recentCases) && recentCases.length > 0) {
            recentCases.slice(0, 3).forEach((caseItem: any) => {
              activity.push({
                action: `Expediente: ${caseItem.title}`,
                time: new Date(caseItem.createdAt).toLocaleDateString(),
                type: 'case',
                id: caseItem.id,
                link: user?.role === 'ADMIN' ? `/admin/cases/${caseItem.id}` : 
                      user?.role === 'ABOGADO' ? `/lawyer/cases/${caseItem.id}` : 
                      `/client/cases/${caseItem.id}`,
                entityType: 'case'
              });
            });
          }
          
          // Agregar citas próximas
          if (Array.isArray(appointments) && appointments.length > 0) {
            const upcomingAppointments = appointments
              .filter((a: any) => new Date(a.date) > new Date())
              .slice(0, 2);
            
            upcomingAppointments.forEach((appointment: any) => {
              activity.push({
                action: `Cita con ${appointment.client?.user?.name || 'Cliente'} - ${new Date(appointment.date).toLocaleDateString()}`,
                time: new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'appointment',
                id: appointment.id,
                link: user?.role === 'ADMIN' ? `/admin/appointments/${appointment.id}` : 
                      user?.role === 'ABOGADO' ? `/lawyer/appointments` : 
                      `/client/appointments`,
                entityType: 'appointment'
              });
            });
          }
          
          // Agregar documentos recientes (si hay datos)
          if (documentsStats && documentsStats.total > 0) {
            activity.push({
              action: `${documentsStats.total} documentos en el sistema`,
              time: 'Total',
              type: 'document',
              link: user?.role === 'ADMIN' ? `/admin/documents` : 
                    user?.role === 'ABOGADO' ? `/lawyer/documents` : 
                    `/client/documents`,
              entityType: 'document'
            });
          }
          
          // Agregar usuarios (solo para admin)
          if (user?.role === 'ADMIN' && totalUsers > 0) {
            activity.push({
              action: `${totalUsers} usuarios registrados`,
              time: 'Total',
              type: 'user',
              link: '/admin/users',
              entityType: 'user'
            });
          }
        }

        setRecentActivity(activity.slice(0, 4)); // Máximo 4 actividades

      } catch (err: any) {
        setError('Error al cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Usuarios" value={stats.totalUsers} change="+12%" positive />
        <StatCard title="Expedientes Activos" value={stats.activeCases} change="+5%" positive />
        <StatCard title="Citas Pendientes" value={stats.pendingAppointments} change="-2%" negative />
        <StatCard title="Documentos" value={stats.recentDocuments} change="+8%" positive />
      </div>

      {/* Tarjetas de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Gestión de Usuarios"
          description="Administrar usuarios, roles y permisos"
          icon="👥"
          link="/admin/users"
          color="blue"
        />
        <DashboardCard
          title="Todos los Expedientes"
          description="Ver y gestionar todos los casos"
          icon="📋"
          link="/admin/cases"
          color="green"
        />
        <DashboardCard
          title="Reportes y Estadísticas"
          description="Análisis y reportes del sistema"
          icon="📊"
          link="/admin/reports"
          color="purple"
        />
        <DashboardCard
          title="Configuración del Sistema"
          description="Configurar parámetros generales"
          icon="⚙️"
          link="/admin/settings"
          color="gray"
        />
        <DashboardCard
          title="Auditoría"
          description="Registros de actividad del sistema"
          icon="🔍"
          link="/admin/audit"
          color="yellow"
        />
        <DashboardCard
          title="Backup y Restauración"
          description="Gestionar copias de seguridad"
          icon="💾"
          link="/admin/backup"
          color="red"
        />
      </div>

      {/* Actividad reciente */}
      <RecentActivity role="ADMIN" activities={recentActivity} />
    </div>
  );

  const renderAbogadoDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Mis Casos" value={stats.totalCases} change="+2%" positive />
        <StatCard title="Casos Activos" value={stats.activeCases} change="+1%" positive />
        <StatCard title="Citas Hoy" value={stats.pendingAppointments} change="0%" neutral />
        <StatCard title="Documentos" value={stats.recentDocuments} change="+3%" positive />
      </div>

      {/* Tarjetas de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Mis Casos"
          description="Gestionar casos asignados"
          icon="📁"
          link="/lawyer/cases"
          color="blue"
        />
        <DashboardCard
          title="Mis Clientes"
          description="Ver información de clientes"
          icon="👤"
          link="/lawyer/clients"
          color="green"
        />
        <DashboardCard
          title="Provisión de Fondos"
          description="Gestiona provisiones de fondos"
          icon="💰"
          link="/lawyer/provisiones"
          color="blue"
        />
        <DashboardCard
          title="Facturación Electrónica"
          description="Gestiona y firma tus facturas"
          icon="🧾"
          link="/lawyer/facturacion"
          color="green"
        />
        <DashboardCard
          title="Calendario de Citas"
          description="Programar y gestionar citas"
          icon="📅"
          link="/lawyer/appointments"
          color="purple"
        />
        <DashboardCard
          title="Documentos"
          description="Gestionar documentos legales"
          icon="📄"
          link="/lawyer/documents"
          color="yellow"
        />
        <DashboardCard
          title="Tareas Pendientes"
          description="Ver tareas y recordatorios"
          icon="✅"
          link="/lawyer/tasks"
          color="red"
        />
        <DashboardCard
          title="Reportes Personales"
          description="Mis estadísticas y reportes"
          icon="📊"
          link="/lawyer/reports"
          color="gray"
        />
      </div>

      {/* Actividad reciente */}
      <RecentActivity role="ABOGADO" activities={recentActivity} />
    </div>
  );

  const renderClienteDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Mis Expedientes" value={stats.totalCases} change="0%" neutral />
        <StatCard title="Casos Activos" value={stats.activeCases} change="0%" neutral />
        <StatCard title="Próxima Cita" value={stats.pendingAppointments} change="0%" neutral />
        <StatCard title="Documentos" value={stats.recentDocuments} change="+1%" positive />
      </div>

      {/* Tarjetas de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Mis Expedientes"
          description="Ver el estado de mis casos"
          icon="📋"
          link="/client/cases"
          color="blue"
        />
        <DashboardCard
          title="Mis Documentos"
          description="Acceder a documentos legales"
          icon="📄"
          link="/client/documents"
          color="green"
        />
        <DashboardCard
          title="Provisiones de Fondos"
          description="Consulta tus provisiones de fondos"
          icon="💰"
          link="/client/provisiones"
          color="blue"
        />
        <DashboardCard
          title="Pagos y Facturas"
          description="Gestiona tus pagos y facturas"
          icon="🧾"
          link="/client/payments"
          color="green"
        />
        <DashboardCard
          title="Programar Cita"
          description="Agendar consulta con abogado"
          icon="📅"
          link="/client/appointments"
          color="purple"
        />
        <DashboardCard
          title="Chat con Abogado"
          description="Comunicación directa"
          icon="💬"
          link="/client/chat"
          color="yellow"
        />
        <DashboardCard
          title="Perfil"
          description="Actualizar información personal"
          icon="👤"
          link="/client/profile"
          color="gray"
        />
      </div>

      {/* Actividad reciente */}
      <RecentActivity role="CLIENTE" activities={recentActivity} />
    </div>
  );

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'ADMIN':
        return renderAdminDashboard();
      case 'ABOGADO':
        return renderAbogadoDashboard();
      case 'CLIENTE':
        return renderClienteDashboard();
      default:
        return <div>Acceso no autorizado</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.name}{user?.email && ` (${user.email})`}
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'ADMIN' && 'Panel de administración del sistema'}
            {user?.role === 'ABOGADO' && 'Gestiona tus casos y clientes'}
            {user?.role === 'CLIENTE' && 'Sigue el progreso de tus casos legales'}
          </p>
        </div>

        {/* Contenido del dashboard */}
        {getDashboardContent()}
      </div>
    </div>
  );
};

// Componente de tarjeta de estadísticas
interface StatCardProps {
  title: string;
  value: number | string;
  change: string;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
}

const StatCard = ({ title, value, change, positive, negative, neutral }: StatCardProps) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className={`text-sm font-semibold ${
                positive ? 'text-green-600' : 
                negative ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

// Componente de tarjeta del dashboard
interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
}

const DashboardCard = ({ title, description, icon, link, color }: DashboardCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    red: 'bg-red-50 border-red-200 hover:bg-red-100',
    gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };

  return (
    <Link to={link} className="block">
      <div className={`bg-white overflow-hidden shadow rounded-lg border-2 transition-colors duration-200 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-3xl">{icon}</div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Componente de actividad reciente
interface RecentActivityProps {
  role: string;
  activities?: any[];
}

const RecentActivity = ({ role, activities = [] }: RecentActivityProps) => {
  const navigate = useNavigate();

  const getActivityData = () => {
    // Si hay actividades reales, usarlas
    if (activities && activities.length > 0) {
      return activities;
    }
    
    // Fallback a datos simulados si no hay datos reales
    switch (role) {
      case 'ADMIN':
        return [
          { 
            action: 'Nuevo usuario registrado', 
            time: 'Hace 5 minutos', 
            type: 'user',
            link: '/admin/users',
            entityType: 'user'
          },
          { 
            action: 'Expediente creado #1234', 
            time: 'Hace 15 minutos', 
            type: 'case',
            link: '/admin/cases',
            entityType: 'case'
          },
          { 
            action: 'Cita programada', 
            time: 'Hace 1 hora', 
            type: 'appointment',
            link: '/admin/appointments',
            entityType: 'appointment'
          },
          { 
            action: 'Documento subido', 
            time: 'Hace 2 horas', 
            type: 'document',
            link: '/admin/documents',
            entityType: 'document'
          }
        ];
      case 'ABOGADO':
        return [
          { 
            action: 'Nuevo caso asignado', 
            time: 'Hace 10 minutos', 
            type: 'case',
            link: '/lawyer/cases',
            entityType: 'case'
          },
          { 
            action: 'Cita con cliente', 
            time: 'Hace 30 minutos', 
            type: 'appointment',
            link: '/lawyer/appointments',
            entityType: 'appointment'
          },
          { 
            action: 'Documento revisado', 
            time: 'Hace 1 hora', 
            type: 'document',
            link: '/lawyer/documents',
            entityType: 'document'
          },
          { 
            action: 'Tarea completada', 
            time: 'Hace 2 horas', 
            type: 'task',
            link: '/lawyer/tasks',
            entityType: 'task'
          }
        ];
      case 'CLIENTE':
        return [
          { 
            action: 'Documento recibido', 
            time: 'Hace 5 minutos', 
            type: 'document',
            link: '/client/documents',
            entityType: 'document'
          },
          { 
            action: 'Cita confirmada', 
            time: 'Hace 1 hora', 
            type: 'appointment',
            link: '/client/appointments',
            entityType: 'appointment'
          },
          { 
            action: 'Actualización de caso', 
            time: 'Hace 3 horas', 
            type: 'case',
            link: '/client/cases',
            entityType: 'case'
          },
          { 
            action: 'Pago procesado', 
            time: 'Hace 1 día', 
            type: 'payment',
            link: '/client/payments',
            entityType: 'payment'
          }
        ];
      default:
        return [];
    }
  };

  const handleActivityClick = (activity: any) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case':
        return '📋';
      case 'appointment':
        return '📅';
      case 'document':
        return '📄';
      case 'task':
        return '✅';
      case 'user':
        return '👤';
      case 'payment':
        return '💰';
      case 'provision':
        return '💳';
      default:
        return '📌';
    }
  };

  const activityData = getActivityData();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activityData.map((activity, index) => (
          <div 
            key={index} 
            className={`px-6 py-4 ${activity.link ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
            onClick={() => activity.link && handleActivityClick(activity)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-lg mr-3">{getActivityIcon(activity.type)}</div>
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${activity.link ? 'text-blue-600 hover:text-blue-800' : 'text-gray-900'}`}>
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              {activity.link && (
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 