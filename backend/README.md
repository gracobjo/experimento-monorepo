# Experimento Backend

API REST completa para sistema de gestión legal, construida con NestJS, Prisma y PostgreSQL.

## 🚀 Características

- **API REST Completa**: Endpoints para todas las funcionalidades del sistema
- **Autenticación JWT**: Sistema seguro de autenticación con roles
- **Base de Datos Relacional**: PostgreSQL con Prisma ORM
- **WebSockets**: Chat en tiempo real con Socket.io
- **Documentación Swagger**: API documentada automáticamente
- **Validación de Datos**: DTOs con class-validator
- **Gestión de Archivos**: Subida y gestión de documentos
- **Facturación Electrónica**: Generación de facturas Facturae
- **Configuración Avanzada**: Parametrización de menús y sitio
- **Teleasistencia**: Sistema de asistencia remota
- **Reportes**: Generación de reportes y estadísticas

## 🛠️ Tecnologías

- **NestJS** - Framework de Node.js
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **Socket.io** - WebSockets
- **Swagger** - Documentación de API
- **Class-validator** - Validación de datos
- **Multer** - Manejo de archivos
- **Nodemailer** - Envío de emails

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/experimento-backend.git
cd experimento-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb experimento_db

# Configurar variables de entorno
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/experimento_db"
JWT_SECRET="tu-jwt-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password"
```

4. **Ejecutar migraciones**
```bash
npx prisma migrate dev
```

5. **Generar cliente Prisma**
```bash
npx prisma generate
```

6. **Ejecutar en desarrollo**
```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000`

## 🏗️ Scripts Disponibles

```bash
npm run start:dev      # Servidor de desarrollo
npm run start          # Servidor de producción
npm run build          # Construir para producción
npm run test           # Ejecutar tests
npm run test:e2e       # Tests end-to-end
npm run lint           # Linting del código
```

## 📁 Estructura del Proyecto

```
src/
├── admin/              # Módulo de administración
├── auth/               # Autenticación y autorización
├── cases/              # Gestión de casos/expedientes
├── chat/               # Sistema de chat
├── documents/          # Gestión de documentos
├── invoices/           # Facturación
├── parametros/         # Sistema de parámetros
├── provision-fondos/   # Provisiones de fondos
├── reports/            # Reportes
├── tasks/              # Gestión de tareas
├── teleassistance/     # Sistema de teleasistencia
├── users/              # Gestión de usuarios
├── prisma/             # Configuración de base de datos
└── main.ts            # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/experimento_db"

# JWT
JWT_SECRET="tu-jwt-secret"
JWT_EXPIRES_IN="24h"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password"

# Aplicación
PORT=3000
NODE_ENV=development
```

### Base de Datos

El proyecto usa Prisma como ORM. Los modelos están definidos en `prisma/schema.prisma`.

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos
npx prisma migrate reset
```

## 📚 API Documentation

### Swagger UI

Acceder a la documentación interactiva en:
`http://localhost:3000/api-docs`

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/forgot-password` - Recuperar contraseña

#### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario

#### Casos
- `GET /api/cases` - Listar casos
- `POST /api/cases` - Crear caso
- `GET /api/cases/:id` - Obtener caso

#### Documentos
- `POST /api/documents/upload` - Subir documento
- `GET /api/documents` - Listar documentos

## 🔐 Autenticación

### Roles del Sistema

- **ADMIN**: Acceso completo
- **ABOGADO**: Gestión de casos y clientes
- **CLIENTE**: Acceso a sus propios datos

### JWT Token

Los tokens JWT se envían en el header:
```
Authorization: Bearer <token>
```

## 🧪 Testing

```bash
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Tests con cobertura
```

## 🚀 Despliegue

### Railway (Recomendado)

1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Desplegar automáticamente

### Render

1. Crear nuevo Web Service
2. Conectar repositorio
3. Configurar build command: `npm install && npm run build`
4. Configurar start command: `npm run start`

### Heroku

```bash
# Instalar Heroku CLI
heroku create tu-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## 📊 Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Case**: Expedientes/casos legales
- **Document**: Documentos del sistema
- **Appointment**: Citas y reuniones
- **Task**: Tareas pendientes
- **Invoice**: Facturas
- **MenuConfig**: Configuración de menús
- **SiteConfig**: Configuración del sitio
- **TeleassistanceSession**: Sesiones de teleasistencia

### Migraciones

```bash
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy
```

## 🔒 Seguridad

- **CORS**: Configurado para dominios específicos
- **Rate Limiting**: Protección contra ataques
- **Input Validation**: Validación de datos de entrada
- **SQL Injection**: Protegido con Prisma
- **XSS**: Headers de seguridad configurados

## 📈 Monitoreo

- **Logs**: Winston para logging
- **Health Check**: Endpoint `/health`
- **Metrics**: Métricas básicas de la aplicación

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
- Revisar la documentación Swagger

## 🔄 Versiones

- **v1.0.0** - Versión inicial con funcionalidades básicas
- **v1.1.0** - Agregado sistema de configuración avanzada
- **v1.2.0** - Implementado teleasistencia y configuración guiada

---

Desarrollado con ❤️ por el equipo de Experimento
