import React from 'react';
import { Box, Typography } from '@mui/material'; // Importa Typography desde @mui/material
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Grafica = ({ diagnosticos }) => {
  if (!diagnosticos || diagnosticos.length === 0) {
    return <Typography variant="h6" color="text.secondary">No hay datos para mostrar en la gráfica</Typography>;
  }

  console.log("Datos recibidos grafica:", diagnosticos);
  const severidades = diagnosticos.map(d => d.severidad);
  console.log("Severidades:", severidades);
  // Preparar los datos para la gráfica
  const datos = {
    labels: severidades.map((_, index) => `Diagnóstico ${index + 1}`),
    // Generar etiquetas dinámicamente basadas en el índice
    datasets: [
      {
        label: 'Severidad',
        data: diagnosticos.map(d => {
          switch (d.severidad) {
            case 'Crítica': return 4;
            case 'Alta': return 3;
            case 'Media': return 2;
            case 'Baja': return 1;
            default: return 0;
          }
        }),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4, // Suaviza las líneas
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  // Imprimir los datos en la consola
  console.log("Datos para la gráfica:", datos);

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            let severidad = '';
            switch (value) {
              case 4: severidad = 'Crítica'; break;
              case 3: severidad = 'Alto'; break;
              case 2: severidad = 'Medio'; break;
              case 1: severidad = 'Bajo'; break;
              default: severidad = 'Sin severidad';
            }
            return `Severidad: ${severidad}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            switch (value) {
              case 4: return 'Crítica';
              case 3: return 'Alto';
              case 2: return 'Medio';
              case 1: return 'Bajo';
              default: return '';
            }
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 3
      }
    },
    animation: {
      duration: 1000, // Duración de la animación en milisegundos
      easing: 'easeOutQuart'
    }
  };

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      position: 'relative',
      '& canvas': {
        maxHeight: '100% !important'
      }
    }}>
      <Line data={datos} options={opciones} />
    </Box>
  );
};

export default Grafica;