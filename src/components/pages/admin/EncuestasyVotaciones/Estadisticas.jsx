import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { API_URL } from "../../../../config/apiConfig";

const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336'];

export default function EstadisticasAnual() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [estadisticas, setEstadisticas] = useState({
    usuarios: [],
    reuniones: [],
    resumenGeneral: {}
  });
  const [loading, setLoading] = useState(false);
  const chartRef = useRef();
  
  // Obtener años disponibles (desde año actual hasta 2019)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2018 }, 
    (_, i) => currentYear - i
  );

  // Cargar datos al cambiar el año
  useEffect(() => {
    cargarEstadisticas();
  }, [selectedYear]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/reuniones/estadisticas-anuales/${selectedYear}`);
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráfica de barras (promedio por usuario)
  const datosGraficaBarras = estadisticas.usuarios?.map(usuario => ({
    nombre: `${usuario.nombre} ${usuario.apellido_paterno}`,
    promedio: parseFloat(usuario.promedio_anual || 0),
    puntaje_obtenido: usuario.puntaje_total,
    puntaje_maximo: usuario.puntaje_maximo,
    porcentaje_asistencia: parseFloat(usuario.porcentaje_asistencia || 0)
  })) || [];

  // Preparar datos para gráfica circular (distribución de calificaciones)
  const datosGraficaCircular = estadisticas.resumenGeneral ? [
    {
      name: 'Excelente (2.5-3.0)',
      value: estadisticas.resumenGeneral.usuarios_excelente || 0,
      color: '#4caf50'
    },
    {
      name: 'Bueno (2.0-2.4)',
      value: estadisticas.resumenGeneral.usuarios_bueno || 0,
      color: '#ff9800'
    },
    {
      name: 'Regular (1.0-1.9)',
      value: estadisticas.resumenGeneral.usuarios_regular || 0,
      color: '#2196f3'
    },
    {
      name: 'Deficiente (0-0.9)',
      value: estadisticas.resumenGeneral.usuarios_deficiente || 0,
      color: '#f44336'
    }
  ] : [];

  // Función para obtener color según promedio
  const getColorByAverage = (promedio) => {
    if (promedio >= 2.5) return 'success';
    if (promedio >= 2.0) return 'warning';
    if (promedio >= 1.0) return 'info';
    return 'error';
  };

  // Función para obtener etiqueta según promedio
  const getLabelByAverage = (promedio) => {
    if (promedio >= 2.5) return 'Excelente';
    if (promedio >= 2.0) return 'Bueno';
    if (promedio >= 1.0) return 'Regular';
    return 'Deficiente';
  };

  // Columnas para la tabla
  const columnas = [
    { 
      field: 'nombre', 
      headerName: 'Nombre', 
      flex: 1,
      minWidth: 120,
      headerClassName: 'super-app-theme--header'
    },
    { 
      field: 'apellido_paterno', 
      headerName: 'Apellido Paterno', 
      flex: 1,
      minWidth: 130,
      headerClassName: 'super-app-theme--header'
    },
    { 
      field: 'apellido_materno', 
      headerName: 'Apellido Materno', 
      flex: 1,
      minWidth: 130,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'puntaje_total',
      headerName: 'Puntaje Obtenido',
      width: 140,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip 
          label={`${params.value} pts`} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      field: 'puntaje_maximo',
      headerName: 'Puntaje Máximo',
      width: 140,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip 
          label={`${params.value} pts`} 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      field: 'promedio_anual',
      headerName: 'Promedio Anual',
      width: 140,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const promedio = parseFloat(params.value || 0);
        return (
          <Chip 
            label={promedio.toFixed(2)} 
            size="small" 
            color={getColorByAverage(promedio)}
          />
        );
      }
    },
    {
      field: 'porcentaje_asistencia',
      headerName: '% Asistencia',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip 
          label={`${parseFloat(params.value || 0).toFixed(1)}%`} 
          size="small" 
          variant="outlined"
          color={parseFloat(params.value || 0) >= 80 ? 'success' : 'warning'}
        />
      )
    },
    {
      field: 'reunion_asistidas',
      headerName: 'Reuniones Asistidas',
      width: 160,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.reuniones_asistidas || 0} / {params.row.total_reuniones || 0}
        </Typography>
      )
    },
    {
      field: 'calificacion',
      headerName: 'Calificación',
      flex: 1,
      minWidth: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const promedio = parseFloat(params.row.promedio_anual || 0);
        return (
          <Chip 
            label={getLabelByAverage(promedio)} 
            size="small" 
            color={getColorByAverage(promedio)}
          />
        );
      }
    }
  ];

  const descargarReporte = async () => {
    try {
      const doc = new jsPDF('l', 'pt', 'a4'); // Landscape para más espacio
      
      // Capturar gráficas
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      // Agregar resumen estadístico
      doc.setFontSize(16);
      let y = imgHeight + 30;
      
      doc.text(`Estadísticas Anuales ${selectedYear}`, 40, y);
      doc.setFontSize(12);
      y += 25;
      
      doc.text(`Total de Reuniones: ${estadisticas.resumenGeneral.total_reuniones || 0}`, 40, y);
      y += 15;
      doc.text(`Total de Usuarios: ${estadisticas.usuarios?.length || 0}`, 40, y);
      y += 15;
      doc.text(`Promedio General: ${parseFloat(estadisticas.resumenGeneral.promedio_general || 0).toFixed(2)}`, 40, y);
      y += 25;

      // Distribución por calificaciones
      doc.text('Distribución por Calificaciones:', 40, y);
      y += 15;
      datosGraficaCircular.forEach(item => {
        doc.text(`${item.name}: ${item.value} usuarios`, 60, y);
        y += 15;
      });

      doc.save(`estadisticas_anuales_${selectedYear}.pdf`);
    } catch (err) {
      console.error('Error al generar reporte:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Encabezado */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Estadísticas Anuales de Reuniones
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <FormControl size="small">
              <InputLabel>Año</InputLabel>
              <Select
                value={selectedYear}
                label="Año"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              onClick={descargarReporte}
              disabled={!estadisticas.usuarios?.length}
            >
              Descargar Reporte PDF
            </Button>
          </Box>

          {/* Resumen general */}
          {estadisticas.resumenGeneral && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                label={`${estadisticas.resumenGeneral.total_reuniones || 0} Reuniones`} 
                color="primary" 
                size="medium"
              />
              <Chip 
                label={`${estadisticas.usuarios?.length || 0} Usuarios`} 
                color="secondary" 
                size="medium"
              />
              <Chip 
                label={`Promedio General: ${parseFloat(estadisticas.resumenGeneral.promedio_general || 0).toFixed(2)}`} 
                color={parseFloat(estadisticas.resumenGeneral.promedio_general || 0) >= 2.0 ? "success" : "error"} 
                size="medium"
              />
              {estadisticas.resumenGeneral.total_reuniones > 0 && (
                <Chip 
                  label={`Puntaje Máximo Posible: ${(estadisticas.resumenGeneral.total_reuniones * 3)} pts`} 
                  color="success"
                  size="medium"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Gráficas */}
        <Box ref={chartRef} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {/* Gráfica circular - Distribución por Calificación */}
            <Paper sx={{ width: 500, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Distribución por Calificación
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={datosGraficaCircular}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {datosGraficaCircular.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {/* Fórmula del reglamento */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Fórmula del Promedio Anual:</strong> Σ(Puntajes obtenidos en cada reunión sindical) / N
            <br />
            <strong>Puntajes:</strong> Asistencia completa: 3 pts | Retardo: 2 pts | Falta justificada: 2 pts | Falta no justificada: 0 pts
            <br />
            <strong>Clasificación:</strong> Excelente: 2.5-3.0 | Bueno: 2.0-2.4 | Regular: 1.0-1.9 | Deficiente: 0-0.9
          </Typography>
        </Alert>

        {/* Tabla de usuarios */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Tabla Detallada de Usuarios - Año {selectedYear}
            </Typography>
            {estadisticas.usuarios?.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Total: {estadisticas.usuarios.length} usuarios
              </Typography>
            )}
          </Box>
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <DataGrid
              rows={estadisticas.usuarios || []}
              columns={columnas}
              getRowId={row => row.id}
              pageSize={25}
              rowsPerPageOptions={[25, 50, 100]}
              disableSelectionOnClick
              loading={loading}
              autoHeight
              disableColumnMenu
              hideFooterSelectedRowCount
              sx={{
                width: '100%',
                '& .super-app-theme--header': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold',
                  color: 'white'
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                '& .MuiDataGrid-columnSeparator': {
                  color: 'white'
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: '8px',
                  borderBottom: '1px solid #e0e0e0'
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflow: 'auto'
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#f5f5f5'
                },
                '& .MuiDataGrid-filler': {
                  display: 'none'
                },
                '& .MuiDataGrid-scrollArea': {
                  display: 'none'
                }
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}