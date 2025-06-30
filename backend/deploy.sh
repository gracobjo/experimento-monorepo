#!/bin/bash

echo "🚀 Desplegando Backend..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurado"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET no está configurado"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Generar Prisma client
echo "🗄️  Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
npx prisma migrate deploy

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

# Ejecutar seed si es necesario
if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Ejecutando seed..."
    npm run prisma:seed
fi

# Ejecutar la aplicación
echo "🎯 Iniciando el backend..."
npm run start:prod 