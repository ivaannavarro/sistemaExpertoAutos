from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, exceptions
from datetime import datetime
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

REGLAS = [
    {
        "sintomas": ["Ruido Extraño"],
        "diagnostico": "Posible problema en la bobina de encendido o válvulas desajustadas.",
        "severidad": "Alta"
    },
    {
        "sintomas": ["Humo Negro"],
        "diagnostico": "Exceso de combustible, posible problema en el sistema de inyección.",
        "severidad": "Media"
    },
    {
        "sintomas": ["Vibraciones"],
        "diagnostico": "Problema en los soportes del motor o alineación defectuosa.",
        "severidad": "Media"
    },
    {
        "sintomas": ["Falla De Encendido"],
        "diagnostico": "Batería descargada, bujías en mal estado o alternador defectuoso.",
        "severidad": "Crítica"
    },
    {
        "sintomas": ["Problema En Los Frenos"],
        "diagnostico": "Pastillas de freno desgastadas o líquido de frenos bajo.",
        "severidad": "Crítica"
    },
    {
        "sintomas": ["Luces Parpadeantes"],
        "diagnostico": "Posible fallo en el alternador o batería con baja carga.",
        "severidad": "Media"
    },
    {
        "sintomas": ["Dificultad Al Cambiar De Marcha"],
        "diagnostico": "Nivel bajo de aceite en la transmisión o embrague desgastado.",
        "severidad": "Alta"
    },
    {
        "sintomas": ["Sobrecalentamiento Del Motor"],
        "diagnostico": "Fuga en el sistema de refrigeración o termostato defectuoso.",
        "severidad": "Crítica"
    },
    {
        "sintomas": ["Pérdida De Potencia"],
        "diagnostico": "Filtro de aire obstruido o inyectores de combustible sucios.",
        "severidad": "Media"
    },
    {
        "sintomas": ["Escape De Aceite"],
        "diagnostico": "Juntas del motor dañadas o sellos defectuosos.",
        "severidad": "Media"
    },
    {
        "sintomas": ["Problema En La Suspensión"],
        "diagnostico": "Amortiguadores desgastados o rótulas en mal estado.",
        "severidad": "Alta"
    },
    {
        "sintomas": ["Desgaste Irregular En Llantas"],
        "diagnostico": "Alineación incorrecta o presión de aire inadecuada.",
        "severidad": "Media"
    },
    {
        "sintomas": ["Alta Vibración En El Volante"],
        "diagnostico": "Problemas en la dirección o balanceo de ruedas deficiente.",
        "severidad": "Alta"
    },
    {
        "sintomas": ["Humo Negro", "Pérdida De Potencia"],
        "diagnostico": "Posible fallo en el sistema de inyección combinado con filtro de aire obstruido.",
        "severidad": "Crítica"
    },
    {
        "sintomas": ["Testo"],
        "diagnostico": "Síntoma de prueba (verificar funcionamiento del sistema).",
        "severidad": "Baja"
    }
]

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

app = Flask(__name__)
CORS(app)


# Endpoints
@app.route('/start', methods=['POST'])
def iniciar():
    return jsonify({
        "diagnostico": "Programa Iniciado",
        "severidad": "",
        "mensaje": "¡Bienvenido! Selecciona las fallas para diagnosticar."
    })

@app.route('/diagnosticos', methods=['GET'])
def obtener_diagnosticos_guardados():
    try:
        if db:
            diagnosticos = []
            docs = db.collection('diagnosticos').order_by('timestamp', direction='DESCENDING').limit(50).stream()
            for doc in docs:
                diag = doc.to_dict()
                diag['id'] = doc.id
                diagnosticos.append(diag)
            return jsonify(diagnosticos), 200
        else:
            return jsonify({"error": "Firestore no disponible"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/debug-reglas', methods=['GET'])
def debug_reglas():
    try:
        if db:  # Si Firebase está conectado
            reglas_ref = db.collection('reglas').stream()
            reglas_firestore = [doc.to_dict() for doc in reglas_ref]
            return jsonify({
                "fuente": "Firestore",
                "reglas": reglas_firestore,
                "total": len(reglas_firestore)
            }), 200
        else:  # Modo local
            return jsonify({
                "fuente": "Local",
                "reglas": REGLAS,
                "total": len(REGLAS)
            }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "mensaje": "Error al obtener reglas"
        }), 500

@app.route('/diagnostico', methods=['POST'])
def obtener_diagnostico():
    try:
        data = request.get_json()
        
        if not data or not isinstance(data.get('sintomas', []), list):
            return jsonify({"error": "Formato inválido. Se requiere lista de 'sintomas'"}), 400
        
        sintomas = [s.strip().title() for s in data['sintomas'] if isinstance(s, str)]
        sintomas_unicos = list(set(sintomas))
        
        if len(sintomas_unicos) != len(sintomas):
            return jsonify({"warning": "Se detectaron síntomas duplicados"}), 400

        resultado = diagnosticar(sintomas_unicos)

        # Guardar en Firestore o en memoria
        diagnostico_data = {
            "sintomas": sintomas_unicos,
            "diagnostico": resultado["diagnostico"],
            "severidad": resultado["severidad"],
            "timestamp": datetime.now().isoformat()
        }

        if db:
            doc_ref = db.collection('diagnosticos').document()
            doc_ref.set(diagnostico_data)
            diagnostico_data['id'] = doc_ref.id
        
        return jsonify(resultado), 200

    except Exception as e:
        app.logger.error(f"Error en /diagnostico: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

# Lógica de diagnóstico
def diagnosticar(sintomas):
    prioridad = {"Crítica": 3, "Alta": 2, "Media": 1, "Baja": 0}
    diagnosticos_encontrados = []

    for regla in REGLAS:
        sintomas_comunes = list(set(sintomas) & set(regla["sintomas"]))
        if sintomas_comunes:
            diagnosticos_encontrados.append({
                "diagnostico": regla["diagnostico"],
                "severidad": regla["severidad"],
                "sintomas_considerados": sintomas_comunes,
                "coincidencias": len(sintomas_comunes),
                "prioridad": prioridad.get(regla["severidad"], 0)
            })

    if diagnosticos_encontrados:
        diagnosticos_encontrados.sort(key=lambda x: (-x['coincidencias'], -x['prioridad']))
        
        return {
            "diagnostico": " ".join(d["diagnostico"] for d in diagnosticos_encontrados),
            "severidad": diagnosticos_encontrados[0]["severidad"],
            "sintomas_considerados": [d["sintomas_considerados"] for d in diagnosticos_encontrados],
            "mensaje": "Este diagnóstico es una recomendación. Para mayor precisión, intenta seleccionar un solo síntoma." if len(diagnosticos_encontrados) > 1 else None
        }
    else:
        return {
            "diagnostico": "Diagnóstico no encontrado. Consulte un especialista.",
            "severidad": "Desconocida",
            "mensaje": None
        }

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

if __name__ == '__main__':
    app.run(debug=os.getenv("FLASK_DEBUG", True), host='0.0.0.0', port=int(os.getenv("PORT", 5000)))