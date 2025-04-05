import firebase_admin
from firebase_admin import credentials, firestore, exceptions
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicialización de Firebase
def initialize_firebase():
    try:
        # Configuración para desarrollo/producción
        if os.getenv("FIREBASE_CONFIG"):  # Usar variables de entorno en producción
            firebase_config = {
                "type": os.getenv("FIREBASE_TYPE"),
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
                "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
            }
            cred = credentials.Certificate(firebase_config)
        else:  # Usar archivo JSON en desarrollo
            cred = credentials.Certificate("../serviceAccountKey.json")
        
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"🔥 Error inicializando Firebase: {str(e)}")
        raise

# Inicializar Firestore
try:
    db = initialize_firebase()
except exceptions.FirebaseError as e:
    print(f"❌ Error crítico: No se pudo conectar a Firestore: {str(e)}")
    db = None  # Modo de fallback (usando lista local) 