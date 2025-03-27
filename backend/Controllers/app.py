from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
#REGLAS PARA EL DIAGNOSTICO DE FALLAS, esto debe ser una base de datos
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
        "sintomas": ["Falla De Encendido"],  # Nota: Normalizado a mayúsculas
        "diagnostico": "Batería descargada, bujías en mal estado o alternador defectuoso.",
        "severidad": "Crítica"
    },
    {
        "sintomas": ["Problema En Los Frenos"],  # Versión normalizada
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
        "diagnostico": "",
        "severidad": "Crítica"
    }
] # Tus reglas actualizadas

#FUNCION PARA EVALUAR LOS SINTOMAS Y DEFINIR EL DIAGNOSTICO
@app.route('/start', methods=['POST'])
#METODO POST
def iniciar():
    return {
            "diagnostico": "Programa Iniciado",
            "severidad": "",
            "mensaje": "¡Bienvenido! Selecciona las fallas para diagnosticar."  # Se incluye solo si hay múltiples diagnósticos
        }

diagnosticos_guardados = []

@app.route('/diagnosticos', methods=['GET'])
def obtener_diagnosticos_guardados():
    return jsonify(diagnosticos_guardados), 200


@app.route('/diagnostico', methods=['POST'])
def obtener_diagnostico():
    try:
        data = request.get_json()
        
        # Validación mejorada
        if not data or not isinstance(data.get('sintomas', []), list):
            return jsonify({"error": "Formato inválido. Se requiere lista de 'sintomas'"}), 400
        
        sintomas = [s.strip().title() for s in data['sintomas'] if isinstance(s, str)]
        
        # Verificar síntomas duplicados
        sintomas_unicos = list(set(sintomas))
        if len(sintomas_unicos) != len(sintomas):
            return jsonify({"warning": "Se detectaron síntomas duplicados"}), 400

        # Obtener diagnóstico
        resultado = diagnosticar(sintomas_unicos)

        # Guardar en la lista
        diagnosticos_guardados.append({
            "sintomas": sintomas_unicos,
            "diagnostico": resultado["diagnostico"],
            "severidad": resultado["severidad"]
        })
        
        return jsonify(resultado), 200

    except Exception as e:
        app.logger.error(f"Error: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

#FUNCION PARA MANDAR LOS DIAGNOSTICOS POR EL ENDPOINT
def diagnosticar(sintomas):
    prioridad = {"Crítica": 3, "Alta": 2, "Media": 1, "Baja": 0}
    diagnosticos_encontrados = []

    # Evaluar cada regla con los síntomas
    for regla in REGLAS:
        sintomas_comunes = list(set(sintomas) & set(regla["sintomas"]))
        cantidad_coincidencias = len(sintomas_comunes)

        if cantidad_coincidencias > 0:
            diagnosticos_encontrados.append({
                "diagnostico": regla["diagnostico"],
                "severidad": regla["severidad"],
                "sintomas_considerados": sintomas_comunes,
                "coincidencias": cantidad_coincidencias,
                "prioridad": prioridad[regla["severidad"]]
            })

    # Si encontramos diagnósticos, los ordenamos por prioridad y coincidencias
    if diagnosticos_encontrados:
        diagnosticos_encontrados.sort(key=lambda x: (x["coincidencias"], x["prioridad"]), reverse=True)

        # Si hay más de un diagnóstico, combinamos los mensajes
        mensaje_diagnostico = "  ".join([d["diagnostico"] for d in diagnosticos_encontrados])

        # Mensaje extra si hay más de un diagnóstico
        mensaje_advertencia = (
            "Este diagnóstico es una recomendación. Para mayor precisión, intenta seleccionar un solo síntoma."
            if len(diagnosticos_encontrados) > 1 else None
        )

        return {
            "diagnostico": mensaje_diagnostico,
            "severidad": diagnosticos_encontrados[0]["severidad"],  # Tomamos la severidad más alta
            "sintomas_considerados": [d["sintomas_considerados"] for d in diagnosticos_encontrados],
            "mensaje": mensaje_advertencia  # Se incluye solo si hay múltiples diagnósticos
        }
    else:
        return {
            "diagnostico": "Diagnóstico no encontrado. Consulte un especialista.",
            "severidad": "Desconocida",
            "mensaje": None  # No hay advertencia si no se encontró un diagnóstico
        }

    
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)