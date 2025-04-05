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
    }
]

PRIORIDADES = {
    "Crítica": 3,
    "Alta": 2,
    "Media": 1,
    "Baja": 0
} 