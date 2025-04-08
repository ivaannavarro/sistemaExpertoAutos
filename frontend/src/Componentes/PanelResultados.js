import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Chip,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: 'calc(100vh - 100px)',
  position: 'sticky',
  top: 20,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  flexDirection: 'column',
}));

const getSeverityIcon = (severidad) => {
  switch (severidad) {
    case 'Crítica':
      return <ErrorIcon color="error" />;
    case 'Alta':
      return <WarningIcon color="warning" />;
    case 'Media':
      return <InfoIcon color="info" />;
    case 'Baja':
      return <CheckCircleIcon color="success" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getSeverityColor = (severidad) => {
  switch (severidad) {
    case 'Crítica':
      return 'error';
    case 'Alta':
      return 'warning';
    case 'Media':
      return 'info';
    case 'Baja':
      return 'success';
    default:
      return 'info';
  }
};

const PanelResultados = ({ diagnosticos, expandedDiagnostico, onExpandClick }) => {
  // Asegurarnos de que diagnosticos sea un array
  const diagnosticosArray = Array.isArray(diagnosticos) ? diagnosticos : [diagnosticos].filter(Boolean);

  return (
    <StyledPaper elevation={3}>
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(145deg, #e3f2fd, #bbdefb)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <BuildIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              Resultados del Diagnóstico
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Historial de diagnósticos realizados
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}>
        {diagnosticosArray.length > 0 ? (
          <List>
            {diagnosticosArray.map((diagnostico, index) => (
              <React.Fragment key={index}>
                <ListItem
                  button
                  onClick={() => onExpandClick(index)}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getSeverityIcon(diagnostico.severidad)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Diagnóstico #{index + 1}
                        </Typography>
                        <Chip
                          label={diagnostico.severidad}
                          color={getSeverityColor(diagnostico.severidad)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {new Date(diagnostico.fecha).toLocaleString()}
                      </Typography>
                    }
                  />
                  <IconButton>
                    {expandedDiagnostico === index ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </ListItem>
                <Collapse in={expandedDiagnostico === index} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {diagnostico.diagnostico}
                    </Typography>
                    
                    {diagnostico.vehiculo && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Información del Vehículo:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<DirectionsCarIcon />}
                            label={`${diagnostico.vehiculo.marca} ${diagnostico.vehiculo.modelo}`}
                            variant="outlined"
                            size="small"
                          />
                          {diagnostico.vehiculo.año && (
                            <Chip
                              icon={<CalendarMonthIcon />}
                              label={`Año: ${diagnostico.vehiculo.año}`}
                              variant="outlined"
                              size="small"
                            />
                          )}
                          {diagnostico.vehiculo.kilometraje && (
                            <Chip
                              icon={<SpeedIcon />}
                              label={`${diagnostico.vehiculo.kilometraje} km`}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {diagnostico.sintomas && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Síntomas reportados:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {diagnostico.sintomas.map((sintoma, i) => (
                            <Chip
                              key={i}
                              label={sintoma}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {diagnostico.mensaje && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {diagnostico.mensaje}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            p: 3,
            textAlign: 'center'
          }}>
            <BuildIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay diagnósticos realizados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Realiza un diagnóstico para ver los resultados aquí
            </Typography>
          </Box>
        )}
      </Box>
    </StyledPaper>
  );
};

export default PanelResultados; 