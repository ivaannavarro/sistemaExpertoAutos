import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {toast } from "react-toastify";
import Toast from "./Toast";
import Registros from "./Registros";
import "../Styles/styles.css"; // Archivo CSS para los estilos

const  Diagnostico = ({
  tabla,
  setTabla
}) => {

  // Estado para almacenar los síntomas seleccionados
  const [sintomas, setSintomas] = useState([]);
  // Estado para almacenar el resultado del diagnóstico
  const [resultado, setResultado] = useState({
    diagnostico: "",
    severidad: ""
  });
  const [diagnosticos, setDiagnosticos] = useState(false);
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    // Muestra un mensaje de éxito al hacer una prueba de que funciona el backend
    inicio();
   }
  , []);

  useEffect(() => {
    // Recarga la lista de registros al obtener un nuevo registro
    obtenerRegistros();
   }
  , [resultado]);
  

  // Lista ampliada de fallas comunes en automóviles
  const listaSintomas = [
    "Ruido Extraño", 
    "Humo Negro", 
    "Vibraciones", 
    "Falla de Encendido", 
    "Problema en los frenos", 
    "Luces parpadeantes",
    "Dificultad al cambiar de marcha", 
    "Sobrecalentamiento del motor",
    "Pérdida de potencia", 
    "Escape de aceite", 
    "Problema en la suspensión",
    "Desgaste irregular en llantas", 
    "Alta vibración en el volante",
    "Testo"
  ];

  // Manejo de selección de síntomas
  const manejarSeleccion = (sintoma) => {
    setSintomas((prev) =>
      prev.includes(sintoma) ? prev.filter((s) => s !== sintoma) : [...prev, sintoma]
    );
  };

  // Función para enviar los síntomas al backend y obtener un diagnóstico
  const inicio = async () => {
    
    try {
        // Se envían los síntomas al backend
        const response = await axios.post(
            'http://localhost:5000/start',
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            }
        );
        // Verifica la estructura real de la respuesta
        console.log("Respuesta completa:", response.data);

        // Se actualiza el estado con el diagnóstico obtenido, si es que lo obtiene
        if (response.data.diagnostico !== '') {
            const diagnosticos = response.data;
          if (diagnosticos.mensaje !== null ) {
            toast.success(diagnosticos.mensaje);
          }
        } 
        else {
          toast.error("El backend no se cargo");
        }

    } catch (error) {
        let errorMessage = "Error: ";
        if (error.response) {
            errorMessage += `Código ${error.response.status} - ${error.response.data?.error || ''}`;
        } else {
            errorMessage += error.message;
        }
        console.error("Error detallado:", error);
        toast.error(errorMessage);
    }
  };

  // Función para consulta la lista de registros
  const obtenerRegistros = async () => {
    
    try {
        // Se envían los síntomas al backend
        const response = await axios.get(
            'http://localhost:5000/diagnosticos',
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            }
        );
        // Verifica la estructura real de la respuesta
        console.log("Respuesta completa:", response.data);

        if (response.data.diagnostico !== '') {
          const registros = response.data;
          
          setRegistros(registros);
            if (registros.mensaje !== null ) {
              toast.warn(diagnosticos.mensaje);
            }
        } 

    } catch (error) {
        let errorMessage = "Error: ";
        if (error.response) {
            errorMessage += `Código ${error.response.status} - ${error.response.data?.error || ''}`;
        } 
        else {
            errorMessage += error.message;
        }
        console.error("Error detallado:", error);
        toast.error(errorMessage);
    }
  };
  
  // Función para enviar los síntomas al backend y obtener un diagnóstico
  const diagnosticar = async () => {
    if (sintomas.length === 0) {
        toast.error("Debes seleccinar un sintoma")
        return
    }
    try {
      //Se implementa una REGEX para que no haya problemas con los datos que se mandan a el Endpoint
        const sintomasNormalizados = sintomas.map(s => 
            s.trim()
             .toLowerCase()
             .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                 index === 0 ? word.toUpperCase() : word.toLowerCase()
             )
        );
        // Se envían los síntomas al backend
        const response = await axios.post(
            'http://localhost:5000/diagnostico',
            { sintomas: sintomasNormalizados },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            }
        );
        // Verifica la estructura real de la respuesta
        console.log("Respuesta completa:", response.data);

        // Se actualiza el estado con el diagnóstico obtenido, si es que lo obtiene
        if (response.data.diagnostico !== '') {
            const diagnosticos = response.data;
            setDiagnosticos(true);
            setResultado(prevResultado => ({
              ...prevResultado, // Mantiene las demás propiedades intactas
              diagnostico: diagnosticos.diagnostico // Solo modifica "diagnostico"
            }));
            setResultado(prevResultado => ({
            ...prevResultado, // Mantiene las demás propiedades intactas
            severidad: diagnosticos.severidad // Solo modifica "severidad"
            }));
            
            if (diagnosticos.mensaje !== null ) {
                toast.warn(diagnosticos.mensaje);
            }
        } 
        else {
            toast.error("No existe un diagnostioco para los sintomas seleccionados");
        }

    } catch (error) {
          let errorMessage = "Error: ";
          if (error.response) {
              errorMessage += `Código ${error.response.status} - ${error.response.data?.error || ''}`;
          } else {
              errorMessage += error.message;
          }
          console.error("Error detallado:", error);
          toast.error(errorMessage);
    }
  };

  // Función para limpiar la selección de síntomas
  const limpiarSeleccion = () => {
      setSintomas([]);
      setResultado("");
      setDiagnosticos(false);
  };


  return (
    <>
      <button 
          className="boton registro" 
          onClick={() => {
            setTabla(!tabla); // Cambia el estado de la tabla
            obtenerRegistros();
          }}
      >
            {tabla ? "Ocultar" : "Mostrar"} Registros
      </button>

      <div className="contenedor" style={{ backgroundImage: "url('/fondo-contenedor.jpg')" }}>
          <h1>Diagnóstico Automotriz Inteligente</h1>
        
          <div className="diagnostico-panel">
              <div className="sintomas">
                  <h2>Selecciona la falla:</h2>
                  <div className="sintomas-grid">
                      {listaSintomas.map((sintoma) => (
                          <label key={sintoma} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={sintomas.includes(sintoma)}
                                onChange={() => manejarSeleccion(sintoma)}
                              />
                                {sintoma}
                          </label>
                      ))}
                  </div>
              </div>

              {/* Botones alineados debajo de las fallas */}
              <div className="acciones">
                  <button 
                      className="boton azul" 
                      onClick={diagnosticar}
                  >
                          Consultar
                  </button>
                  <button 
                      className="boton rojo" 
                      onClick={limpiarSeleccion}
                  >
                          Limpiar
                  </button>
              </div>
          </div>
          {
            diagnosticos === true &&  
              <div className="resultado">
                  <h2>Diagnóstico:</h2>
                  <p>{resultado.diagnostico}</p>
                  <h2>Severidad:</h2>
                  <p>{resultado.severidad}</p>
              </div>
          }
        
      </div>

      {tabla &&
          
          <Registros
              registros={registros}
          />
      }

      <Toast/>
    </>
  );
};

PropTypes.Diagnostico = {
  tabla: PropTypes.bool,
  setTabla: PropTypes.func

};

export default Diagnostico;
