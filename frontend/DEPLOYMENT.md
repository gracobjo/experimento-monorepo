# Despliegue del Frontend

## Plataformas Soportadas

### 1. Vercel (Recomendado)

1. **Crear cuenta en Vercel**: https://vercel.com
2. **Conectar repositorio**: Conecta tu repositorio de GitHub
3. **Configurar proyecto**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

4. **Variables de entorno**:
   - `VITE_API_URL`: URL del backend (ej: https://experimento-backend.onrender.com)
   - `VITE_CHATBOT_URL`: URL del chatbot (ej: https://experimento-chatbot.onrender.com)

5. **Desplegar**: Vercel detectará automáticamente la configuración y desplegará

### 2. Netlify

1. **Crear cuenta en Netlify**: https://netlify.com
2. **Conectar repositorio**
3. **Configurar build**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18

4. **Variables de entorno**:
   - `VITE_API_URL`
   - `VITE_CHATBOT_URL`

### 3. Render

1. **Crear cuenta en Render**: https://render.com
2. **Conectar repositorio**
3. **Crear Static Site**:
   - **Name**: `experimento-frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`

4. **Variables de entorno**:
   - `VITE_API_URL`
   - `VITE_CHATBOT_URL`

### 4. GitHub Pages

1. **Configurar GitHub Actions**:
   Crear archivo `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Configurar GitHub Pages** en la configuración del repositorio

## Variables de Entorno

| Variable | Descripción | Requerida | Valor por defecto |
|----------|-------------|-----------|-------------------|
| `VITE_API_URL` | URL del backend API | Sí | http://localhost:3000 |
| `VITE_CHATBOT_URL` | URL del chatbot | Sí | http://localhost:8000 |
| `VITE_NODE_ENV` | Entorno de ejecución | No | production |

## Configuración de Build

### Vite Configuration

El archivo `vite.config.ts` ya está configurado para:
- Build optimizado para producción
- Soporte para variables de entorno
- Configuración de base path

### Optimizaciones

1. **Code Splitting**: Automático con Vite
2. **Tree Shaking**: Eliminación de código no usado
3. **Minificación**: CSS y JS minificados
4. **Compresión**: Gzip automático

## Verificación del Despliegue

1. **Página principal**: Cargar sin errores
2. **API calls**: Verificar conexión con backend
3. **Chatbot**: Verificar conexión WebSocket
4. **Rutas**: Navegación SPA funcionando

## Troubleshooting

### Error: Variables de entorno no cargan
```bash
# Verificar que las variables empiecen con VITE_
VITE_API_URL=https://your-backend.com
VITE_CHATBOT_URL=https://your-chatbot.com
```

### Error: Build falla
```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Verificar dependencias
npm audit fix
```

### Error: Rutas no funcionan (404)
Configurar redirects para SPA:
- **Vercel**: Usar `vercel.json`
- **Netlify**: Crear `_redirects` con `/* /index.html 200`
- **Render**: Configurar en settings

### Error: CORS en desarrollo
```bash
# Verificar configuración en backend
FRONTEND_URL=https://your-frontend-domain.com
```

## Optimización de Rendimiento

### Lighthouse Score

1. **Performance**: >90
2. **Accessibility**: >95
3. **Best Practices**: >90
4. **SEO**: >90

### Optimizaciones Implementadas

- **Lazy Loading**: Componentes cargados bajo demanda
- **Image Optimization**: Imágenes optimizadas
- **Bundle Splitting**: Código dividido por rutas
- **Caching**: Headers de cache configurados

## Monitoreo

- **Analytics**: Integrar Google Analytics o similar
- **Error Tracking**: Sentry o similar
- **Performance**: Web Vitals monitoring
- **Uptime**: Monitoreo de disponibilidad

## Seguridad

- **CSP Headers**: Configurados en nginx
- **HTTPS**: Forzado en producción
- **XSS Protection**: Headers de seguridad
- **Content Type**: Headers de seguridad 