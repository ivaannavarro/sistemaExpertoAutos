from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from config import db
from testo import *
from constants import CORS_HEADERS, APP_CONFIG
from datetime import datetime
from google.cloud import firestore
import logging

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)


# Endpoints, PARA AGREGAR UN ENDPOINT PRIMERO DEBES IMPORTAR LA CLASE DONDE SE ENCUENTRA
# NO OLVIDES IMPORTAR EL METODO Y LA DIRECCION POR LA CUAL SE LLAMARA, TAMBIEN A LA FUNCION QUE LLAMA
app.route('/start', methods=['POST'])(iniciar)
app.route('/diagnosticos', methods=['GET'])(obtener_diagnosticos_guardados)
app.route('/debug-reglas', methods=['GET'])(debug_reglas)
app.route('/diagnostico', methods=['POST'])(obtener_diagnostico)
app.route('/allDiagnosticos', methods=['POST'])(obtenerTodosDiagnosticos)
app.route('/obtenerVehiculos', methods=['POST'])(obtenerVehiculos)

#LAS FUNCIONES DE ABAJO SON PARA CARGAR DATOS DEL VEHICULO, EN TEORIA NO DEBERIAN SER MODIFICADAS
#PARA AGREGAR UN ENDPOINT HAZLO ARRIBA

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Verificar conexión con Firestore
        if not db:
            return jsonify({
                "status": "warning",
                "message": "Modo local activado - Firestore no disponible",
                "diagnosticos": [],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }), 200

        try:
            # Verificar si la colección existe y tiene documentos
            coll_ref = db.collection('diagnosticos')
            total_docs = len(list(coll_ref.limit(1).get()))
            
            if total_docs == 0:
                return jsonify({
                    "status": "ok",
                    "message": "Servidor funcionando pero no hay diagnósticos registrados",
                    "diagnosticos": [],
                    "total_documentos": 0,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }), 200

            # Obtener los 5 diagnósticos más antiguos (orden ascendente)
            query = (coll_ref
                    .order_by('fecha', direction=firestore.Query.ASCENDING)
                    .limit(5))
            
            results = query.stream()
            ultimos_diagnosticos = []

            for doc in results:
                data = doc.to_dict()
                doc_id = doc.id
                
                # Procesamiento de fechas robusto
                fecha_data = {
                    'id': doc_id,
                    'timestamp_firestore': None,
                    'fecha_legible': None
                }
                
                if 'fecha' in data:
                    if hasattr(data['fecha'], 'timestamp'):  # Timestamp de Firestore
                        fecha_data['timestamp_firestore'] = data['fecha'].isoformat()
                        fecha_data['fecha_legible'] = data['fecha'].strftime("%d/%m/%Y %H:%M:%S")
                    elif isinstance(data['fecha'], str):  # String ISO
                        try:
                            dt = datetime.fromisoformat(data['fecha'])
                            fecha_data['timestamp_firestore'] = dt.isoformat()
                            fecha_data['fecha_legible'] = dt.strftime("%d/%m/%Y %H:%M:%S")
                        except ValueError:
                            fecha_data['error_fecha'] = "Formato inválido"
                
                # Conservar todos los datos originales
                resultado = {
                    **data,
                    **fecha_data
                }
                ultimos_diagnosticos.append(resultado)

            return jsonify({
                "status": "ok",
                "message": f"Se encontraron {len(ultimos_diagnosticos)} diagnósticos",
                "diagnosticos": ultimos_diagnosticos,
                "orden": "ascendente (más antiguo primero)",
                "total_documentos": total_docs,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }), 200

        except Exception as e:
            logging.error(f"Error al consultar Firestore: {str(e)}", exc_info=True)
            return jsonify({
                "status": "warning",
                "message": f"Error al acceder a los diagnósticos: {str(e)}",
                "diagnosticos": [],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }), 200

    except Exception as e:
        logging.critical(f"Error en health check: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": f"Error interno del servidor: {str(e)}",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500

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

def procesar_diagnostico():
    try:
        # Validar y obtener datos del request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos en el request"}), 400

        sintomas = data.get('sintomas', [])
        vehiculo = data.get('vehiculo', {})
        
        if not sintomas or not isinstance(sintomas, list):
            return jsonify({"error": "Se requiere una lista de síntomas válida"}), 400

        # Obtener diagnóstico del sistema experto
        try:
            from testo import obtener_diagnostico as obtener_diagnostico_sistema
            diagnostico = obtener_diagnostico_sistema()
            
            if isinstance(diagnostico, tuple):
                diagnostico = diagnostico[0].get_json()
        except Exception as e:
            logging.error(f"Error al obtener diagnóstico: {str(e)}")
            return jsonify({"error": "Error en el sistema de diagnóstico"}), 500

        # Preparar documento con formato correcto de fecha
        doc_data = {
            'sintomas': sintomas,
            'vehiculo': vehiculo,
            'diagnostico': diagnostico.get('diagnostico', 'No determinado'),
            'severidad': diagnostico.get('severidad', 'Bajo'),
            'fecha': firestore.SERVER_TIMESTAMP,  # Usamos timestamp del servidor
            'fecha_legible': datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Opcional para legibilidad
        }

        # Guardar en Firestore
        response_data = doc_data.copy()
        
        if db:
            try:
                doc_ref = db.collection('diagnosticos').document()
                doc_ref.set(doc_data)
                response_data['id'] = doc_ref.id
                response_data['fecha_firestore'] = doc_ref.get().to_dict().get('fecha').isoformat()
            except Exception as e:
                logging.warning(f"Error al guardar en Firestore: {str(e)}")
                response_data['warning'] = "Diagnóstico generado pero no guardado en DB"
                # Continuamos aunque falle Firestore

        # Preparar respuesta
        response_data['status'] = 'success'
        response_data['timestamp_respuesta'] = datetime.utcnow().isoformat() + "Z"
        
        return jsonify(response_data), 200

    except Exception as e:
        logging.critical(f"Error en procesar_diagnostico: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Error interno del servidor",
            "details": str(e),
            "status": "error",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500

@app.after_request
def add_cors_headers(response):
    for header, value in CORS_HEADERS.items():
        response.headers[header] = value
    return response

if __name__ == '__main__':
    print("[START] Iniciando servidor...")
    print(f"[INFO] Modo: {'Desarrollo' if APP_CONFIG['DEBUG'] else 'Producción'}")
    print(f"[INFO] Host: {APP_CONFIG['HOST']}")
    print(f"[INFO] Puerto: {APP_CONFIG['PORT']}")
    print(f"[INFO] Firestore: {'Conectado' if db else 'Modo Local'}")
    
    app.run(
        debug=os.getenv("FLASK_DEBUG", APP_CONFIG["DEBUG"]),
        host=os.getenv("HOST", APP_CONFIG["HOST"]),
        port=int(os.getenv("PORT", APP_CONFIG["PORT"]))
    )