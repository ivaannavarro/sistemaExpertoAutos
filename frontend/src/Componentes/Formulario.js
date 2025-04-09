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
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const Formulario = ({ onGuardar }) => {
  const [formData, setFormData] = useState({
	marca: '',
	modelo: '',
	año: '',
	kilometraje: '',
	descripcion: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
	const { name, value } = e.target;
	setFormData(prev => ({
	  ...prev,
	  [name]: value
	}));
	// Limpiar error específico cuando el usuario comienza a escribir
	if (errors[name]) {
	  setErrors(prev => ({
		...prev,
		[name]: ""
	  }));
	}
  };

  const validateForm = () => {
	const newErrors = {};
	if (!formData.marca.trim()) newErrors.marca = "La marca es requerida";
	if (!formData.modelo.trim()) newErrors.modelo = "El modelo es requerido";
	if (!formData.año.trim()) newErrors.año = "El año es requerido";
	if (!formData.kilometraje.trim()) newErrors.kilometraje = "El kilometraje es requerido";

	setErrors(newErrors);
	return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
	e.preventDefault();
	setError('');
	setSuccess(false);

	if (!validateForm()) {
	  return;
	}

	try {
	  const datosEnviar = {
		...formData,
		año: parseInt(formData.año),
		kilometraje: parseInt(formData.kilometraje)
	  };

	  console.log('Datos a enviar:', datosEnviar);

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
		throw new Error(errorData.error || 'Error al guardar el vehículo');
	  }

	  const data = await response.json();
	  console.log('Datos recibidos:', data);

	  setSuccess(true);
	  onGuardar(datosEnviar);
	  setFormData({
		marca: '',
		modelo: '',
		año: '',
		kilometraje: '',
		descripcion: ''
	  });
	  setErrors({});
	} catch (error) {
	  console.error('Error completo:', error);
	  setError(error.message);
	}
  };	

  return (
	<Card sx={{
	  borderRadius: '20px',
	  background: 'rgba(255, 255, 255, 0.95)',
	  backdropFilter: 'blur(10px)',
	  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
	  border: '1px solid rgba(255, 255, 255, 0.2)'
	}}>
	  <CardContent>
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
		  <DirectionsCarIcon color="primary" sx={{ fontSize: 40 }} />
		  <Box>
			<Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
			  Información del Vehículo
			</Typography>
			<Typography variant="subtitle1" color="text.secondary">
			  Ingresa los datos de tu vehículo
			</Typography>
		  </Box>
		</Box>

		{error && (
		  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
			{error}
		  </Alert>
		)}

		{success && (
		  <Alert
			severity="success"
			sx={{
			  mb: 3,
			  borderRadius: '12px',
			  '& .MuiAlert-icon': {
				color: 'success.main'
			  }
			}}
		  >
			Vehículo guardado correctamente
		  </Alert>
		)}

		<form onSubmit={handleSubmit}>
		  <Grid container spacing={3}>
			<Grid item xs={12} sm={6}>
			  <TextField
				fullWidth
				label="Marca"
				name="marca"
				value={formData.marca}
				onChange={handleChange}
				error={!!errors.marca}
				helperText={errors.marca}
				variant="outlined"
				InputProps={{
				  startAdornment: (
					<InputAdornment position="start">
					  <DirectionsCarIcon color={errors.marca ? "error" : "action"} />
					</InputAdornment>
				  ),
				}}
				sx={{
				  '& .MuiOutlinedInput-root': {
					borderRadius: '12px',
					'&:hover fieldset': {
					  borderColor: 'primary.main',
					},
				  },
				}}
			  />
			</Grid>

			<Grid item xs={12} sm={6}>
			  <TextField
				fullWidth
				label="Modelo"
				name="modelo"
				value={formData.modelo}
				onChange={handleChange}
				error={!!errors.modelo}
				helperText={errors.modelo}
				variant="outlined"
				InputProps={{
				  startAdornment: (
					<InputAdornment position="start">
					  <DirectionsCarIcon color={errors.modelo ? "error" : "action"} />
					</InputAdornment>
				  ),
				}}
				sx={{
				  '& .MuiOutlinedInput-root': {
					borderRadius: '12px',
					'&:hover fieldset': {
					  borderColor: 'primary.main',
					},
				  },
				}}
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
				error={!!errors.año}
				helperText={errors.año}
				variant="outlined"
				InputProps={{
				  startAdornment: (
					<InputAdornment position="start">
					  <CalendarMonthIcon color={errors.año ? "error" : "action"} />
					</InputAdornment>
				  ),
				}}
				sx={{
				  '& .MuiOutlinedInput-root': {
					borderRadius: '12px',
					'&:hover fieldset': {
					  borderColor: 'primary.main',
					},
				  },
				}}
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
				error={!!errors.kilometraje}
				helperText={errors.kilometraje}
				variant="outlined"
				InputProps={{
				  startAdornment: (
					<InputAdornment position="start">
					  <SpeedIcon color={errors.kilometraje ? "error" : "action"} />
					</InputAdornment>
				  ),
				}}
				sx={{
				  '& .MuiOutlinedInput-root': {
					borderRadius: '12px',
					'&:hover fieldset': {
					  borderColor: 'primary.main',
					},
				  },
				}}
			  />
			</Grid>

			<Grid item xs={12}>
			  <TextField
				fullWidth
				label="Descripción del Problema"
				name="descripcion"
				value={formData.descripcion}
				onChange={handleChange}
				multiline
				rows={4}
				variant="outlined"
				InputProps={{
				  startAdornment: (
					<InputAdornment position="start">
					  <DescriptionIcon color="action" />
					</InputAdornment>
				  ),
				}}
				sx={{
				  '& .MuiOutlinedInput-root': {
					borderRadius: '12px',
					'&:hover fieldset': {
					  borderColor: 'primary.main',
					},
				  },
				}}
			  />
			</Grid>

			<Grid item xs={12}>
			  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
				<Button
				  variant="outlined"
				  color="primary"
				  onClick={() => {
					setFormData({
					  marca: '',
					  modelo: '',
					  año: '',
					  kilometraje: '',
					  descripcion: ''
					});
					setErrors({});
				  }}
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
				  <CloseIcon sx={{ mr: 1 }} />
				  Limpiar
				</Button>
				<Button
				  type="submit"
				  variant="contained"
				  color="primary"
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
				  <CheckIcon sx={{ mr: 1 }} />
				  Guardar
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
