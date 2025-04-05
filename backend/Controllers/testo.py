from flask import jsonify, request
from datetime import datetime
from config import db
from constants import ERROR_MESSAGES, HTTP_STATUS
from reglas import REGLAS, PRIORIDADES

# Endpoints
def iniciar():
    return jsonify({
        "diagnostico": "Programa Iniciado",
        "severidad": "",
        "mensaje": "¡Bienvenido! Selecciona las fallas para diagnosticar."
    }), HTTP_STATUS["OK"]

def obtener_diagnosticos_guardados():
    try:
        if db:
            diagnosticos = []
            docs = db.collection('diagnosticos').order_by('timestamp', direction='DESCENDING').limit(50).stream()
            for doc in docs:
                diag = doc.to_dict()
                diag['id'] = doc.id
                diagnosticos.append(diag)
            return jsonify(diagnosticos), HTTP_STATUS["OK"]
        else:
            return jsonify({"error": ERROR_MESSAGES["FIREBASE_UNAVAILABLE"]}), HTTP_STATUS["SERVICE_UNAVAILABLE"]
    except Exception as e:
        return jsonify({"error": str(e)}), HTTP_STATUS["INTERNAL_ERROR"]

def debug_reglas():
    try:
        if db:  # Si Firebase está conectado
            reglas_ref = db.collection('reglas').stream()
            reglas_firestore = [doc.to_dict() for doc in reglas_ref]
            return jsonify({
                "fuente": "Firestore",
                "reglas": reglas_firestore,
                "total": len(reglas_firestore)
            }), HTTP_STATUS["OK"]
        else:  # Modo local
            return jsonify({
                "fuente": "Local",
                "reglas": REGLAS,
                "total": len(REGLAS)
            }), HTTP_STATUS["OK"]
    except Exception as e:
        return jsonify({
            "error": str(e),
            "mensaje": "Error al obtener reglas"
        }), HTTP_STATUS["INTERNAL_ERROR"]

def obtener_diagnostico():
    try:
        data = request.get_json()
        
        if not data or not isinstance(data.get('sintomas', []), list):
            return jsonify({"error": ERROR_MESSAGES["INVALID_FORMAT"]}), HTTP_STATUS["BAD_REQUEST"]
        
        sintomas = [s.strip().title() for s in data['sintomas'] if isinstance(s, str)]
        sintomas_unicos = list(set(sintomas))
        
        if len(sintomas_unicos) != len(sintomas):
            return jsonify({"warning": ERROR_MESSAGES["DUPLICATE_SYMPTOMS"]}), HTTP_STATUS["BAD_REQUEST"]

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
        
        return jsonify(resultado), HTTP_STATUS["OK"]

    except Exception as e:
        return jsonify({"error": ERROR_MESSAGES["INTERNAL_ERROR"]}), HTTP_STATUS["INTERNAL_ERROR"]

# Lógica de diagnóstico
def diagnosticar(sintomas):
    diagnosticos_encontrados = []

    for regla in REGLAS:
        sintomas_comunes = list(set(sintomas) & set(regla["sintomas"]))
        if sintomas_comunes:
            diagnosticos_encontrados.append({
                "diagnostico": regla["diagnostico"],
                "severidad": regla["severidad"],
                "sintomas_considerados": sintomas_comunes,
                "coincidencias": len(sintomas_comunes),
                "prioridad": PRIORIDADES.get(regla["severidad"], 0)
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