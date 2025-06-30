#!/bin/bash

echo "🚀 Desplegando Frontend..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Verificar variables de entorno
if [ -z "$VITE_API_URL" ]; then
    echo "⚠️  Advertencia: VITE_API_URL no está configurado"
fi

if [ -z "$VITE_CHATBOT_URL" ]; then
    echo "⚠️  Advertencia: VITE_CHATBOT_URL no está configurado"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

# Verificar que la construcción fue exitosa
if [ ! -d "dist" ]; then
    echo "❌ Error: La construcción falló, no se encontró el directorio dist"
    exit 1
fi

echo "✅ Frontend construido exitosamente en el directorio dist/"
echo "📁 Archivos generados:"
ls -la dist/

# Si estamos en un entorno de producción, servir con nginx
if [ "$NODE_ENV" = "production" ]; then
    echo "🌐 Iniciando servidor nginx..."
    nginx -g "daemon off;"
else
    echo "🔧 Modo desarrollo: ejecuta 'npm run preview' para ver la aplicación"
fi 