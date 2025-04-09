import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {toast } from "react-toastify";
import Toast from "./Toast";
import "../Styles/styles.css"; // Archivo CSS para los estilos
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Chip, Avatar} from '@mui/material';
import Formulario from './Formulario';
import Grafica from './Grafica';
import PanelResultados from './PanelResultados';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import HistorialDiagnosticos from './HistorialDiagnosticos';

const Diagnostico = ({
  tabla,
  setTabla
}) => {

  // Estado para almacenar los síntomas seleccionados
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState([]);
  // Estado para almacenar el resultado del diagnóstico
  const [resultado, setResultado] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [infoVehiculo, setInfoVehiculo] = useState(null);
  const [expandedDiagnostico, setExpandedDiagnostico] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [grafica, setGrafica] = useState(null);

  useEffect(() => {
    verificarConexion();
  }, []);

  useEffect(() => {
    if (resultado) {
    obtenerRegistros();
   }
  }, [resultado]);

  const verificarConexion = async () => {
    try {
      console.log('Intentando conectar con el servidor...');
      const response = await axios.post('http://localhost:5000/start', {
        timeout: 5000 // 5 segundos de timeout
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.status === 200) {
        setConectado(true);
        if (response.data.ultimos_diagnosticos) {
          console.log('Diagnósticos recibidos:', response.data.ultimos_diagnosticos);
          setDiagnosticos(response.data.ultimos_diagnosticos);
        }
        toast.success('Conexión establecida con el servidor');
      } else {
        console.error('Error en la respuesta:', response.status, response.data);
        setConectado(false);
        toast.error(`Error en la conexión: ${response.data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setConectado(false);
      
      if (error.response) {
        // El servidor respondió con un código de error
        toast.error(`Error del servidor: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        // La petición fue hecha pero no hubo respuesta
        toast.error('No se pudo conectar con el servidor. Verifica que esté en ejecución.');
      } else {
        // Error al configurar la petición
        toast.error(`Error al configurar la conexión: ${error.message}`);
      }
    }
  };

  // Lista ampliada de fallas comunes en automóviles
  const sintomas = [
    "Ruido Extraño", 
    "Humo Negro", 
    "Vibraciones", 
    "Falla De Encendido",
    "Problema En Los Frenos",
    "Luces Parpadeantes",
    "Dificultad Al Cambiar De Marcha",
    "Sobrecalentamiento Del Motor",
    "Pérdida De Potencia",
    "Escape De Aceite",
    "Problema En La Suspensión",
    "Desgaste Irregular En Llantas",
    "Alta Vibración En El Volante"
  ];

  // Manejo de selección de síntomas
  const handleSintomaClick = (sintoma) => {
    setSintomasSeleccionados(prev => {
      if (prev.includes(sintoma)) {
        return prev.filter(s => s !== sintoma);
      } else {
        return [...prev, sintoma];
      }
    });
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

  console.log("GRAFICA DATA",grafica);

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

        setGrafica(response.data);
        // Se actualiza el estado con el diagnóstico obtenido, si es que lo obtiene

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
  const realizarDiagnostico = async () => {
    if (sintomasSeleccionados.length === 0) {
      toast.error("Debes seleccionar al menos un síntoma");
      return;
    }

    if (!infoVehiculo) {
      toast.error("Debes completar la información del vehículo primero");
      setMostrarFormulario(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/diagnostico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sintomas: sintomasSeleccionados,
          vehiculo: infoVehiculo
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }

      // Asegurarnos de que diagnosticos sea un array antes de actualizarlo
      setDiagnosticos(prevDiagnosticos => {
        const nuevosDiagnosticos = Array.isArray(prevDiagnosticos) ? prevDiagnosticos : [];
        return [data, ...nuevosDiagnosticos];
      });

      setResultado(data);
      toast.success('Diagnóstico realizado con éxito');
    } catch (error) {
      console.error('Error al realizar el diagnóstico:', error);
      toast.error('Error al realizar el diagnóstico: ' + error.message);
    }
  };

  const handleGuardarInfoVehiculo = (data) => {
    setInfoVehiculo(data);
    setMostrarFormulario(false);
    toast.success('Información del vehículo guardada correctamente');
  };

  // Función para limpiar la selección de síntomas
  // const limpiarSeleccion = () => {
  //     setSintomasSeleccionados([]);
  //     setResultado(null);
  //     setDiagnosticos([]);
  // };

  const handleExpandClick = (index) => {
    setExpandedDiagnostico(expandedDiagnostico === index ? null : index);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      p: 3,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Toast />
      
      {/* Layout principal */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: 3,
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Columna izquierda */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Panel de selección de síntomas */}
          <Paper elevation={3} sx={{ 
            p: 3, 
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <BuildIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    Diagnóstico de Vehículo
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Selecciona los síntomas que presenta tu vehículo
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setMostrarHistorial(true)}
                startIcon={<HistoryIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                Ver Historial
              </Button>
            </Box>
            
            {infoVehiculo && (
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                borderRadius: '16px',
                background: 'linear-gradient(145deg, #e3f2fd, #bbdefb)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(25, 118, 210, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <DirectionsCarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {infoVehiculo.marca} {infoVehiculo.modelo}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip 
                        icon={<CalendarMonthIcon />}
                        label={`Año: ${infoVehiculo.año}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip 
                        icon={<SpeedIcon />}
                        label={`${infoVehiculo.kilometraje} km`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
            
            <Box sx={{ mt: 2, mb: 3 }}>
              {sintomasSeleccionados.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Síntomas seleccionados:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {sintomasSeleccionados.map((sintoma) => (
                      <Chip
                        key={sintoma}
                        label={sintoma}
                        onDelete={() => handleSintomaClick(sintoma)}
                        color="primary"
                        variant="outlined"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <List sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1,
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {sintomas.map((sintoma) => (
                <ListItem
                  key={sintoma}
                  button
                  onClick={() => handleSintomaClick(sintoma)}
                  selected={sintomasSeleccionados.includes(sintoma)}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={sintoma}
                    primaryTypographyProps={{
                      variant: 'body1',
                      color: sintomasSeleccionados.includes(sintoma) ? 'primary' : 'text.primary',
                      fontWeight: sintomasSeleccionados.includes(sintoma) ? 'bold' : 'normal'
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={realizarDiagnostico}
                disabled={sintomasSeleccionados.length === 0 || !infoVehiculo}
                size="large"
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Realizar Diagnóstico
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                size="large"
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                {mostrarFormulario ? (
                  <>
                    <CloseIcon sx={{ mr: 1 }} />
                    Ocultar Formulario
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    Agregar Vehículo
                  </>
                )}
              </Button>
            </Box>
          </Paper>

          {/* Formulario */}
          {mostrarFormulario && (
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: '96%'
            }}>
              <Formulario onGuardar={handleGuardarInfoVehiculo} />
            </Paper>
          )}

          {grafica && (
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    Estadísticas de Diagnósticos
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Análisis de los diagnósticos realizados
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Grafica diagnosticos={grafica} />
              </Box>
            </Paper>
          )}
        </Box>

        {/* Panel de Resultados */}
        <PanelResultados 
          diagnosticos={diagnosticos}
          expandedDiagnostico={expandedDiagnostico}
          onExpandClick={handleExpandClick}
        />
      </Box>

      {/* Modal de Historial */}
      <HistorialDiagnosticos 
        open={mostrarHistorial}
        onClose={() => setMostrarHistorial(false)}
      />
    </Box>
  );
};

PropTypes.Diagnostico = {
  tabla: PropTypes.bool,
  setTabla: PropTypes.func
};

export default Diagnostico;
