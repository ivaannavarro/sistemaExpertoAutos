# Mensajes de error
ERROR_MESSAGES = {
    "INVALID_FORMAT": "Formato inválido. Se requiere lista de 'sintomas'",
    "DUPLICATE_SYMPTOMS": "Se detectaron síntomas duplicados",
    "FIREBASE_UNAVAILABLE": "Firestore no disponible",
    "INTERNAL_ERROR": "Error interno del servidor"
}

# Códigos de estado HTTP
HTTP_STATUS = {
    "OK": 200,
    "BAD_REQUEST": 400,
    "INTERNAL_ERROR": 500,
    "SERVICE_UNAVAILABLE": 503
}

# Configuración de CORS
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

# Configuración de la aplicación
APP_CONFIG = {
    "DEBUG": True,
    "HOST": '0.0.0.0',
    "PORT": 5000
} 