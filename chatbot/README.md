# Experimento Chatbot

Chatbot inteligente para asistencia legal y gestión de consultas, construido con Python y FastAPI.

## 🚀 Características

- **Chatbot Inteligente**: Respuestas automáticas a consultas legales
- **API REST**: Endpoints para integración con frontend
- **Procesamiento de Lenguaje Natural**: Análisis de consultas de usuarios
- **Base de Conocimientos**: Respuestas predefinidas para casos comunes
- **Integración con Sistema Principal**: Comunicación con backend principal
- **Logs de Conversaciones**: Registro de interacciones
- **Configuración Flexible**: Fácil personalización de respuestas
- **Múltiples Idiomas**: Soporte para español e inglés

## 🛠️ Tecnologías

- **Python 3.11+** - Lenguaje principal
- **FastAPI** - Framework web moderno
- **Uvicorn** - Servidor ASGI
- **Pydantic** - Validación de datos
- **SQLAlchemy** - ORM para base de datos
- **Alembic** - Migraciones de base de datos
- **OpenAI GPT** - Modelo de lenguaje (opcional)
- **NLTK** - Procesamiento de lenguaje natural
- **Pytest** - Testing framework

## 📦 Instalación

### Prerrequisitos

- Python 3.11+
- pip
- Base de datos (PostgreSQL/SQLite)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/experimento-chatbot.git
cd experimento-chatbot
```

2. **Crear entorno virtual**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Base de Datos
DATABASE_URL=sqlite:///./chatbot.db

# API Principal
MAIN_API_URL=http://localhost:3000/api

# Configuración del Chatbot
CHATBOT_NAME=ExperimentoBot
CHATBOT_VERSION=1.0.0

# OpenAI (opcional)
OPENAI_API_KEY=tu-api-key
```

5. **Inicializar base de datos**
```bash
python -m alembic upgrade head
```

6. **Ejecutar en desarrollo**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El chatbot estará disponible en `http://localhost:8000`

## 🏗️ Scripts Disponibles

```bash
# Desarrollo
uvicorn main:app --reload          # Servidor de desarrollo
python main.py                     # Ejecutar directamente

# Testing
pytest                             # Ejecutar tests
pytest --cov                       # Tests con cobertura

# Base de Datos
alembic upgrade head               # Aplicar migraciones
alembic revision --autogenerate    # Crear nueva migración
```

## 📁 Estructura del Proyecto

```
experimento-chatbot/
├── main.py                    # Punto de entrada principal
├── main_improved.py          # Versión mejorada del chatbot
├── requirements.txt          # Dependencias de Python
├── .env                      # Variables de entorno
├── .env.example             # Ejemplo de variables de entorno
├── alembic.ini              # Configuración de Alembic
├── app/
│   ├── __init__.py
│   ├── models.py            # Modelos de base de datos
│   ├── schemas.py           # Esquemas Pydantic
│   ├── database.py          # Configuración de base de datos
│   ├── chatbot.py           # Lógica del chatbot
│   └── api.py               # Endpoints de la API
├── migrations/               # Migraciones de Alembic
├── tests/                    # Tests unitarios
└── data/                     # Datos de entrenamiento
    ├── responses.json        # Respuestas predefinidas
    └── patterns.json         # Patrones de reconocimiento
```

## 🔧 Configuración

### Variables de Entorno

```env
# Base de Datos
DATABASE_URL=sqlite:///./chatbot.db

# API Principal
MAIN_API_URL=http://localhost:3000/api

# Chatbot
CHATBOT_NAME=ExperimentoBot
CHATBOT_VERSION=1.0.0
CHATBOT_LANGUAGE=es

# OpenAI (opcional)
OPENAI_API_KEY=tu-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Logging
LOG_LEVEL=INFO
LOG_FILE=chatbot.log
```

### Configuración del Chatbot

El chatbot puede configurarse editando los archivos JSON en `data/`:

- `responses.json`: Respuestas predefinidas
- `patterns.json`: Patrones de reconocimiento de intenciones

## 📚 API Documentation

### Endpoints Principales

#### Chat
- `POST /chat` - Enviar mensaje al chatbot
- `GET /chat/history` - Obtener historial de chat
- `DELETE /chat/history` - Limpiar historial

#### Información
- `GET /info` - Información del chatbot
- `GET /health` - Estado del servicio

### Ejemplo de Uso

```python
import requests

# Enviar mensaje
response = requests.post("http://localhost:8000/chat", json={
    "message": "¿Cómo puedo crear un expediente?",
    "user_id": "123"
})

print(response.json())
```

## 🤖 Funcionalidades del Chatbot

### Respuestas Automáticas

- **Consultas Legales**: Información sobre procedimientos legales
- **Gestión de Casos**: Ayuda con expedientes
- **Citas**: Información sobre citas y reuniones
- **Documentos**: Ayuda con gestión de documentos
- **Facturación**: Información sobre facturas
- **Configuración**: Ayuda con configuración del sistema

### Procesamiento de Lenguaje

- **Análisis de Intención**: Detectar qué quiere el usuario
- **Extracción de Entidades**: Identificar información relevante
- **Respuestas Contextuales**: Respuestas basadas en contexto
- **Fallback**: Respuestas cuando no entiende la consulta

## 🧪 Testing

```bash
# Tests unitarios
pytest

# Tests con cobertura
pytest --cov=app

# Tests específicos
pytest tests/test_chatbot.py

# Tests de integración
pytest tests/test_api.py
```

## 🚀 Despliegue

### Railway (Recomendado)

1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Desplegar automáticamente

### Render

1. Crear nuevo Web Service
2. Conectar repositorio
3. Configurar build command: `pip install -r requirements.txt`
4. Configurar start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### PythonAnywhere

1. Subir código a PythonAnywhere
2. Instalar dependencias
3. Configurar WSGI file
4. Configurar variables de entorno

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Construir imagen
docker build -t experimento-chatbot .

# Ejecutar contenedor
docker run -p 8000:8000 experimento-chatbot
```

## 📊 Base de Datos

### Modelos

- **ChatMessage**: Mensajes del chat
- **ChatSession**: Sesiones de chat
- **ChatResponse**: Respuestas del chatbot

### Migraciones

```bash
# Crear migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head
```

## 🔒 Seguridad

- **Validación de Entrada**: Pydantic para validación
- **Rate Limiting**: Protección contra spam
- **Sanitización**: Limpieza de datos de entrada
- **Logs Seguros**: No registrar información sensible

## 📈 Monitoreo

- **Logs**: Registro de todas las interacciones
- **Métricas**: Estadísticas de uso
- **Health Check**: Estado del servicio
- **Performance**: Tiempo de respuesta

## 🔧 Personalización

### Agregar Nuevas Respuestas

Editar `data/responses.json`:

```json
{
  "intent": "crear_expediente",
  "patterns": ["crear expediente", "nuevo caso", "abrir expediente"],
  "responses": [
    "Para crear un expediente, ve a la sección 'Casos' y haz clic en 'Nuevo Expediente'."
  ]
}
```

### Configurar Patrones

Editar `data/patterns.json`:

```json
{
  "greeting": ["hola", "buenos días", "buenas"],
  "farewell": ["adiós", "hasta luego", "chao"],
  "help": ["ayuda", "soporte", "asistencia"]
}
```

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
- Revisar la documentación de la API

## 🔄 Versiones

- **v1.0.0** - Versión inicial con funcionalidades básicas
- **v1.1.0** - Mejoras en procesamiento de lenguaje
- **v1.2.0** - Integración con sistema principal

## 🚀 Roadmap

- [ ] Integración con OpenAI GPT
- [ ] Soporte multiidioma
- [ ] Análisis de sentimientos
- [ ] Respuestas con voz
- [ ] Integración con WhatsApp

---

Desarrollado con ❤️ por el equipo de Experimento 