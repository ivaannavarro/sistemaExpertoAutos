import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Grafica = ({ diagnosticos }) => {
  const [estadisticas, setEstadisticas] = useState({
    fallas: {},
    marcas: {}
  });

  useEffect(() => {
    if (diagnosticos && diagnosticos.length > 0) {
      const fallas = {};
      const marcas = {};

      diagnosticos.forEach(diag => {
        // Contar fallas
        if (diag.sintomas) {
          diag.sintomas.forEach(sintoma => {
            fallas[sintoma] = (fallas[sintoma] || 0) + 1;
          });
        }

        // Contar marcas
        if (diag.vehiculo && diag.vehiculo.marca) {
          marcas[diag.vehiculo.marca] = (marcas[diag.vehiculo.marca] || 0) + 1;
        }
      });

      setEstadisticas({ fallas, marcas });
    }
  }, [diagnosticos]);

  const datosFallas = {
    labels: Object.keys(estadisticas.fallas),
    datasets: [
      {
        label: 'Frecuencia de Fallas',
        data: Object.values(estadisticas.fallas),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const datosMarcas = {
    labels: Object.keys(estadisticas.marcas),
    datasets: [
      {
        data: Object.values(estadisticas.marcas),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Fallas Más Comunes
            </Typography>
            <Bar data={datosFallas} options={opciones} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Marcas de Vehículos
            </Typography>
            <Pie data={datosMarcas} options={opciones} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Grafica;
