# Experimento Frontend

Sistema de gestión legal con interfaz de usuario moderna y responsiva, construido con React, TypeScript y Tailwind CSS.

## 🚀 Características

- **Interfaz Moderna**: Diseño responsivo con Tailwind CSS
- **Autenticación**: Sistema de login/registro con roles (ADMIN, ABOGADO, CLIENTE)
- **Dashboard Dinámico**: Paneles personalizados por rol de usuario
- **Gestión de Casos**: CRUD completo de expedientes legales
- **Sistema de Citas**: Calendario y gestión de citas
- **Chat en Tiempo Real**: Comunicación instantánea entre usuarios
- **Gestión de Documentos**: Subida y gestión de archivos
- **Facturación**: Generación de facturas electrónicas
- **Configuración Avanzada**: Parametrización de menús y configuración del sitio
- **Configuración Guiada**: Asistente para configurar el sistema por tipo de negocio
- **Teleasistencia**: Sistema de asistencia remota para usuarios

## 🛠️ Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router** - Enrutamiento de la aplicación
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Zustand** - Gestión de estado
- **Socket.io Client** - Comunicación en tiempo real

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/experimento-frontend.git
cd experimento-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con las URLs de tu backend:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de producción
npm run test         # Ejecutar tests
npm run lint         # Linting del código
```

## 📁 Estructura del Proyecto

```
src/
├── api/                 # Cliente HTTP y endpoints
├── components/          # Componentes reutilizables
│   ├── HomeBuilder/     # Sistema de construcción de páginas
│   └── ...
├── context/            # Contextos de React
├── hooks/              # Hooks personalizados
├── pages/              # Páginas de la aplicación
│   ├── admin/          # Páginas de administrador
│   ├── lawyer/         # Páginas de abogado
│   └── client/         # Páginas de cliente
├── tests/              # Tests unitarios
└── main.tsx           # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

- `VITE_API_URL`: URL del backend API
- `VITE_WS_URL`: URL del WebSocket para chat
- `VITE_APP_NAME`: Nombre de la aplicación

### Configuración de Tailwind

El proyecto usa Tailwind CSS con configuración personalizada en `tailwind.config.js`.

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Netlify

1. Conectar repositorio a Netlify
2. Configurar build command: `npm run build`
3. Configurar publish directory: `dist`

### GitHub Pages

```bash
npm run build
# Subir contenido de dist/ a gh-pages branch
```

## 🔐 Autenticación

El sistema soporta tres roles:

- **ADMIN**: Acceso completo al sistema
- **ABOGADO**: Gestión de casos y clientes
- **CLIENTE**: Acceso a sus propios casos y documentos

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
npm run test           # Tests unitarios
npm run test:coverage  # Tests con cobertura
```

## 📚 Documentación

- [Guía de Configuración](./docs/configuracion.md)
- [API Reference](./docs/api.md)
- [Componentes](./docs/componentes.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación

## 🔄 Versiones

- **v1.0.0** - Versión inicial con funcionalidades básicas
- **v1.1.0** - Agregado sistema de configuración avanzada
- **v1.2.0** - Implementado teleasistencia y configuración guiada

---

Desarrollado con ❤️ por el equipo de Experimento 