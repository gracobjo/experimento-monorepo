# Despliegue del Chatbot

## Plataformas Soportadas

### 1. Render (Recomendado)

1. **Crear cuenta en Render**: https://render.com
2. **Conectar repositorio**: Conecta tu repositorio de GitHub
3. **Crear nuevo Web Service**:
   - **Name**: `experimento-chatbot`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python -m spacy download es_core_news_sm && python -m spacy download en_core_web_sm && python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"
     ```
   - **Start Command**: `uvicorn main_improved:app --host 0.0.0.0 --port $PORT`

4. **Variables de entorno**:
   - `HF_API_TOKEN`: Tu token de Hugging Face (opcional)
   - `FRONTEND_URL`: URL del frontend (ej: https://experimento-frontend.onrender.com)

### 2. Railway

1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio**
3. **Configurar variables de entorno**:
   - `HF_API_TOKEN`
   - `FRONTEND_URL`

### 3. Heroku

1. **Instalar Heroku CLI**
2. **Crear aplicación**:
   ```bash
   heroku create experimento-chatbot
   ```
3. **Configurar buildpacks**:
   ```bash
   heroku buildpacks:add heroku/python
   ```
4. **Configurar variables**:
   ```bash
   heroku config:set HF_API_TOKEN=your_token
   heroku config:set FRONTEND_URL=https://your-frontend-url.com
   ```
5. **Desplegar**:
   ```bash
   git push heroku main
   ```

## Variables de Entorno

| Variable | Descripción | Requerida | Valor por defecto |
|----------|-------------|-----------|-------------------|
| `HF_API_TOKEN` | Token de Hugging Face para IA | No | - |
| `FRONTEND_URL` | URL del frontend | Sí | http://localhost:5173 |
| `PORT` | Puerto del servidor | No | 8000 |

## Verificación del Despliegue

1. **Health Check**: `GET /health`
2. **Documentación API**: `GET /docs`
3. **WebSocket**: `ws://your-domain/ws`

## Troubleshooting

### Error: Modelos de spaCy no encontrados
```bash
python -m spacy download es_core_news_sm
python -m spacy download en_core_web_sm
```

### Error: Recursos NLTK no encontrados
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"
```

### Error: Puerto ya en uso
Cambiar el puerto en el comando de inicio:
```bash
uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

## Monitoreo

- **Logs**: Revisar logs de la plataforma
- **Métricas**: Uso de CPU y memoria
- **Errores**: Endpoint `/health` para verificar estado 