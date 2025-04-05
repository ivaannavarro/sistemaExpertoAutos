import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {toast } from "react-toastify";
import Toast from "./Toast";
import Registros from "./Registros";
import "../Styles/styles.css"; // Archivo CSS para los estilos
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Grid, Container, Card, CardContent, Divider, Chip, IconButton, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Formulario from './Formulario';
import Grafica from './Grafica';

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

      const data = await response.json();
      setResultado(data);
      setDiagnosticos(prev => [...prev, data]);
    } catch (error) {
      console.error('Error al realizar el diagnóstico:', error);
      toast.error('Error al realizar el diagnóstico');
    }
  };

  const handleGuardarInfoVehiculo = (data) => {
    setInfoVehiculo(data);
    setMostrarFormulario(false);
    toast.success('Información del vehículo guardada correctamente');
  };

  // Función para limpiar la selección de síntomas
  const limpiarSeleccion = () => {
      setSintomasSeleccionados([]);
      setResultado(null);
      setDiagnosticos([]);
  };

  const handleExpandClick = (index) => {
    setExpandedDiagnostico(expandedDiagnostico === index ? null : index);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Panel de Síntomas */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Selecciona los síntomas que presenta tu vehículo
            </Typography>
            
            {infoVehiculo && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="primary">
                  Vehículo: {infoVehiculo.marca} {infoVehiculo.modelo} ({infoVehiculo.año})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kilometraje: {infoVehiculo.kilometraje} km
                </Typography>
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
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemText 
                    primary={sintoma}
                    primaryTypographyProps={{
                      variant: 'body1',
                      color: sintomasSeleccionados.includes(sintoma) ? 'primary' : 'text.primary'
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
              >
                Realizar Diagnóstico
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                size="large"
              >
                {mostrarFormulario ? 'Ocultar Formulario' : 'Agregar Información del Vehículo'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Panel de Resultados */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Historial de Diagnósticos
            </Typography>
            
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              maxHeight: '600px',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}>
              {diagnosticos.length > 0 ? (
                diagnosticos.map((diagnostico, index) => (
                  <Card 
                    key={index} 
                    variant="outlined" 
                    sx={{ 
                      mb: 2,
                      '&:last-child': {
                        mb: 0
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          Diagnóstico #{diagnosticos.length - index}
                        </Typography>
                        <IconButton
                          onClick={() => handleExpandClick(index)}
                          size="small"
                        >
                          {expandedDiagnostico === index ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedDiagnostico === index}>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1" paragraph>
                            {diagnostico.diagnostico}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" color="text.secondary">
                            Severidad: {diagnostico.severidad}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Fecha: {new Date().toLocaleString()}
                          </Typography>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '200px',
                  backgroundColor: 'grey.100',
                  borderRadius: 1
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Realiza un diagnóstico para ver los resultados
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Formulario */}
        {mostrarFormulario && (
          <Grid item xs={12}>
            <Formulario onGuardar={handleGuardarInfoVehiculo} />
          </Grid>
        )}

        {/* Gráficas */}
        {diagnosticos.length > 0 && (
          <Grid item xs={12}>
            <Grafica diagnosticos={diagnosticos} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

PropTypes.Diagnostico = {
  tabla: PropTypes.bool,
  setTabla: PropTypes.func

};

export default Diagnostico;
