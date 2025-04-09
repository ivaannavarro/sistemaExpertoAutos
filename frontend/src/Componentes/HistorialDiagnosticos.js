import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { toast } from 'react-toastify';

const HistorialDiagnosticos = ({ open, onClose }) => {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      cargarDiagnosticos();
    }
  }, [open]);

  const cargarDiagnosticos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/allDiagnosticos');
      setDiagnosticos(response.data);
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error);
      toast.error('Error al cargar el historial de diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/diagnostico/${id}`);
      setDiagnosticos(diagnosticos.filter(d => d.id !== id));
      toast.success('Diagnóstico eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar diagnóstico:', error);
      toast.error('Error al eliminar el diagnóstico');
    }
  };

  const getSeverityIcon = (severidad) => {
    switch (severidad) {
      case 'Alto':
        return <ErrorIcon color="error" />;
      case 'Medio':
        return <WarningIcon color="warning" />;
      case 'Bajo':
        return <InfoIcon color="info" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <DirectionsCarIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              Historial de Diagnósticos
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Todos los diagnósticos realizados
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : diagnosticos.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3,
            textAlign: 'center'
          }}>
            <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay diagnósticos realizados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Realiza un diagnóstico para ver el historial
            </Typography>
          </Box>
        ) : (
          <List>
            {diagnosticos.map((diagnostico, index) => (
              <React.Fragment key={diagnostico.id}>
                <ListItem
                  sx={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getSeverityIcon(diagnostico.severidad)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {diagnostico.vehiculo?.marca} {diagnostico.vehiculo?.modelo}
                        </Typography>
                        <Chip
                          icon={getSeverityIcon(diagnostico.severidad)}
                          label={diagnostico.severidad}
                          color={diagnostico.severidad === 'Alto' ? 'error' : 
                                 diagnostico.severidad === 'Medio' ? 'warning' : 'info'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(diagnostico.fecha).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {diagnostico.diagnostico}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleEliminar(diagnostico.id)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < diagnosticos.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
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
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistorialDiagnosticos; 