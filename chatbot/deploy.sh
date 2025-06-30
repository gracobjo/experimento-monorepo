#!/bin/bash

echo "🚀 Desplegando Chatbot..."

# Verificar que estamos en el directorio correcto
if [ ! -f "main_improved.py" ]; then
    echo "❌ Error: No se encontró main_improved.py"
    exit 1
fi

# Verificar que existe requirements.txt
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: No se encontró requirements.txt"
    exit 1
fi

# Verificar variables de entorno
if [ -z "$HF_API_TOKEN" ]; then
    echo "⚠️  Advertencia: HF_API_TOKEN no está configurado"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
pip install -r requirements.txt

# Descargar modelos de spaCy
echo "🤖 Descargando modelos de spaCy..."
python -m spacy download es_core_news_sm
python -m spacy download en_core_web_sm

# Descargar recursos de NLTK
echo "📚 Descargando recursos de NLTK..."
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Ejecutar la aplicación
echo "🎯 Iniciando el chatbot..."
uvicorn main_improved:app --host 0.0.0.0 --port $PORT 