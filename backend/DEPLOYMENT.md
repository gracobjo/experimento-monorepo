# Despliegue del Backend

## Plataformas Soportadas

### 1. Render (Recomendado)

1. **Crear cuenta en Render**: https://render.com
2. **Conectar repositorio**: Conecta tu repositorio de GitHub
3. **Crear nueva base de datos PostgreSQL**:
   - **Name**: `experimento-postgres`
   - **Database**: `experimento_db`
   - **User**: `experimento_user`

4. **Crear nuevo Web Service**:
   - **Name**: `experimento-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`

5. **Variables de entorno**:
   - `DATABASE_URL`: Se configura automáticamente desde la base de datos
   - `JWT_SECRET`: Tu clave secreta para JWT (generar una segura)
   - `JWT_EXPIRES_IN`: 24h
   - `FRONTEND_URL`: URL del frontend
   - `EMAIL_HOST`: Servidor SMTP (ej: smtp.gmail.com)
   - `EMAIL_PORT`: 587
   - `EMAIL_USER`: Tu email
   - `EMAIL_PASS`: Contraseña de aplicación del email

### 2. Railway

1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio**
3. **Agregar servicio PostgreSQL**
4. **Configurar variables de entorno**:
   - `DATABASE_URL`: URL de la base de datos de Railway
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - Variables de email

### 3. Heroku

1. **Instalar Heroku CLI**
2. **Crear aplicación**:
   ```bash
   heroku create experimento-backend
   ```
3. **Agregar base de datos**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
4. **Configurar variables**:
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set FRONTEND_URL=https://your-frontend-url.com
   heroku config:set EMAIL_HOST=smtp.gmail.com
   heroku config:set EMAIL_USER=your_email@gmail.com
   heroku config:set EMAIL_PASS=your_app_password
   ```
5. **Desplegar**:
   ```bash
   git push heroku main
   ```

## Variables de Entorno

| Variable | Descripción | Requerida | Valor por defecto |
|----------|-------------|-----------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | Sí | - |
| `JWT_SECRET` | Clave secreta para JWT | Sí | - |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | No | 24h |
| `FRONTEND_URL` | URL del frontend | Sí | http://localhost:5173 |
| `EMAIL_HOST` | Servidor SMTP | No | - |
| `EMAIL_PORT` | Puerto SMTP | No | 587 |
| `EMAIL_USER` | Usuario de email | No | - |
| `EMAIL_PASS` | Contraseña de email | No | - |
| `UPLOAD_PATH` | Ruta para archivos | No | ./uploads |

## Configuración de Base de Datos

### PostgreSQL en Render

1. **Crear base de datos**:
   - Plan gratuito: 1GB de almacenamiento
   - Conexiones: 5 simultáneas
   - Backup: Automático

2. **Migraciones**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed de datos**:
   ```bash
   npm run prisma:seed
   ```

## Verificación del Despliegue

1. **Health Check**: `GET /health`
2. **Documentación API**: `GET /api`
3. **Base de datos**: Verificar conexión en logs

## Troubleshooting

### Error: Base de datos no conecta
```bash
# Verificar URL de conexión
echo $DATABASE_URL

# Probar conexión
npx prisma db push
```

### Error: JWT_SECRET no configurado
```bash
# Generar clave secreta
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Error: Migraciones fallan
```bash
# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset

# O aplicar migraciones manualmente
npx prisma migrate deploy
```

### Error: Email no funciona
1. Verificar configuración SMTP
2. Usar contraseña de aplicación (Gmail)
3. Verificar puerto y host

## Monitoreo

- **Logs**: Revisar logs de la plataforma
- **Base de datos**: Monitorear conexiones y consultas
- **API**: Endpoint `/health` para verificar estado
- **Archivos**: Verificar directorio de uploads

## Seguridad

- **JWT_SECRET**: Usar clave de 64 caracteres mínimo
- **CORS**: Configurar solo dominios permitidos
- **Rate Limiting**: Implementado automáticamente
- **Helmet**: Headers de seguridad automáticos 