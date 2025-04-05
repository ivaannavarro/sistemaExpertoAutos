import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';

const Formulario = ({ onGuardar }) => {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: '',
    kilometraje: '',
    descripcionProblema: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación de campos obligatorios
    if (!formData.marca || !formData.modelo) {
      setError('Por favor, complete los campos obligatorios (marca y modelo)');
      return;
    }

    try {
      // Convertir año y kilometraje a números si están presentes
      const datosEnviar = {
        marca: formData.marca,
        modelo: formData.modelo,
        ...(formData.año && { año: parseInt(formData.año) }),
        ...(formData.kilometraje && { kilometraje: parseInt(formData.kilometraje) }),
        ...(formData.descripcionProblema && { descripcionProblema: formData.descripcionProblema })
      };

      console.log('Datos del formulario antes de enviar:', formData);
      console.log('Datos convertidos a enviar:', datosEnviar);

      const response = await fetch('http://localhost:5000/vehiculo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosEnviar),
      });

      console.log('Respuesta del servidor:', response);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al enviar los datos');
      }

      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);
      
      setSuccess('Datos del vehículo guardados exitosamente');
      
      // Llamar a la función onGuardar con los datos
      onGuardar(datosEnviar);
      
      // Limpiar el formulario
      setFormData({
        marca: '',
        modelo: '',
        año: '',
        kilometraje: '',
        descripcionProblema: ''
      });
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al enviar los datos: ' + error.message);
    }
  };

  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Información del Vehículo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marca *"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                variant="outlined"
                error={error && !formData.marca}
                helperText={error && !formData.marca ? "Campo obligatorio" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo *"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                variant="outlined"
                error={error && !formData.modelo}
                helperText={error && !formData.modelo ? "Campo obligatorio" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Año"
                name="año"
                type="number"
                value={formData.año}
                onChange={handleChange}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kilometraje"
                name="kilometraje"
                type="number"
                value={formData.kilometraje}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción del Problema"
                name="descripcionProblema"
                value={formData.descripcionProblema}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Guardar Información
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default Formulario;
