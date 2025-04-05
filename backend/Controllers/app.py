from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from config import db
from testo import iniciar, obtener_diagnosticos_guardados, debug_reglas, obtener_diagnostico
from constants import CORS_HEADERS, APP_CONFIG
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Endpoints
app.route('/start', methods=['POST'])(iniciar)
app.route('/diagnosticos', methods=['GET'])(obtener_diagnosticos_guardados)
app.route('/debug-reglas', methods=['GET'])(debug_reglas)
app.route('/diagnostico', methods=['POST'])(obtener_diagnostico)

@app.route('/vehiculo', methods=['POST'])
def guardar_vehiculo():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        campos_requeridos = ['marca', 'modelo']
        for campo in campos_requeridos:
            if not data.get(campo):
                return jsonify({"error": f"El campo {campo} es requerido"}), 400

        # Guardar en Firestore
        if db:
            doc_ref = db.collection('vehiculos').document()
            doc_ref.set({
                **data,
                'timestamp': datetime.now().isoformat()
            })
            return jsonify({
                "mensaje": "Vehículo registrado exitosamente",
                "id": doc_ref.id
            }), 201
        else:
            return jsonify({"error": "Firestore no disponible"}), 503

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.after_request
def add_cors_headers(response):
    for header, value in CORS_HEADERS.items():
        response.headers[header] = value
    return response

if __name__ == '__main__':
    app.run(
        debug=os.getenv("FLASK_DEBUG", APP_CONFIG["DEBUG"]),
        host=os.getenv("HOST", APP_CONFIG["HOST"]),
        port=int(os.getenv("PORT", APP_CONFIG["PORT"]))
    )