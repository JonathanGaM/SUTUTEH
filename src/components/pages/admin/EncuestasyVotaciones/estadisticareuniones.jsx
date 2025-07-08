import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { API_URL } from "../../../../config/apiConfig";

const COLORS = ['#4caf50', '#f44336']; // Verde para asistieron, rojo para no asistieron

// Función para obtener el color del chip según el estado de asistencia
const getEstadoColor = (estado) => {
  switch (estado) {
    case 'asistencia_completa':
      return 'success';
    case 'retardo':
      return 'warning';
    case 'falta_justificada':
      return 'info';
    case 'falta_no_justificada':
      return 'error';
    default:
      return 'default';
  }
};

// Función para obtener el label del estado
const getEstadoLabel = (estado) => {
  switch (estado) {
    case 'asistencia_completa':
      return 'Asistencia Completa';
    case 'retardo':
      return 'Retardo';
    case 'falta_justificada':
      return 'Falta Justificada';
    case 'falta_no_justificada':
      return 'Falta No Justificada';
    default:
      return estado;
  }
};

export default function AsistenciaReuniones() {
  const { id: reunionId } = useParams();
  const [tab, setTab] = useState(0);
  const [meeting, setMeeting] = useState(null);
  const [asistieron, setAsistieron] = useState([]);
  const [noAsistieron, setNoAsistieron] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const headerChartRef = useRef();
  
  // ✅ NUEVO: Estado separado para la gráfica
  const [pieDataGrafica, setPieDataGrafica] = useState([
    { name: 'Asistieron', value: 0 },
    { name: 'No asistieron', value: 0 }
  ]);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/reuniones/${reunionId}/estadisticas`);
      setMeeting(data.meeting);
      setAsistieron(data.asistieron);
      setNoAsistieron(data.noAsistieron);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setSnackbar({ 
        open: true, 
        message: 'Error al cargar datos de la reunión', 
        severity: 'error' 
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [reunionId]);

  // ✅ NUEVO: useEffect para manejar la gráfica en tiempo real
  useEffect(() => {
    const actualizarGraficaEnTiempoReal = async () => {
      if (!meeting) return;

      // Si la reunión está en Registro_Abierto o Retardos_Permitidos
      if (meeting.status === 'Registro_Abierto' || meeting.status === 'Retardos_Permitidos') {
        try {
          // Obtener total de usuarios que podrían asistir
          const { data: usuariosFaltantes } = await axios.get(`${API_URL}/api/reuniones/${reunionId}/faltantes`);
          const totalUsuarios = asistieron.length + usuariosFaltantes.length;
          
          setPieDataGrafica([
            { name: 'Asistieron', value: asistieron.length },
            { name: 'No asistieron', value: totalUsuarios - asistieron.length }
          ]);
        } catch (err) {
          console.error('Error al obtener usuarios faltantes:', err);
          // Fallback a datos normales
          setPieDataGrafica([
            { name: 'Asistieron', value: asistieron.length },
            { name: 'No asistieron', value: noAsistieron.length }
          ]);
        }
      } else {
        // Para otros estados (Falta_No_Justificada, Terminada), usar datos finales
        setPieDataGrafica([
          { name: 'Asistieron', value: asistieron.length },
          { name: 'No asistieron', value: noAsistieron.length }
        ]);
      }
    };

    actualizarGraficaEnTiempoReal();
  }, [meeting?.status, asistieron.length, noAsistieron.length, reunionId]);

  // Función para cambiar el estado de asistencia
  const handleEstadoChange = async (usuarioId, nuevoEstado) => {
    try {
      await axios.put(
        `${API_URL}/api/reuniones/${reunionId}/asistencia/${usuarioId}`,
        { estado_asistencia: nuevoEstado }
      );
      
      setSnackbar({ 
        open: true, 
        message: 'Estado actualizado correctamente', 
        severity: 'success' 
      });
      
      // Recargar datos
      cargarDatos();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setSnackbar({ 
        open: true, 
        message: 'Error al actualizar estado', 
        severity: 'error' 
      });
    }
  };

  // Columnas para la tabla de asistieron
  const columnasAsistieron = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'apellido_paterno', headerName: 'Apellido Paterno', flex: 1 },
    { field: 'apellido_materno', headerName: 'Apellido Materno', flex: 1 },
    {
      field: 'estado_asistencia',
      headerName: 'Estado',
      flex: 1,
      renderCell: (params) => (
        <FormControl size="small" fullWidth>
          <Select
            value={params.value}
            onChange={(e) => handleEstadoChange(params.row.id, e.target.value)}
            variant="outlined"
          >
            <MenuItem value="asistencia_completa">
              <Chip 
                label="Asistencia Completa" 
                size="small" 
                color="success" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem value="retardo">
              <Chip 
                label="Retardo" 
                size="small" 
                color="warning" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem value="falta_justificada">
              <Chip 
                label="Falta Justificada" 
                size="small" 
                color="info" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem value="falta_no_justificada">
              <Chip 
                label="Falta No Justificada" 
                size="small" 
                color="error" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
          </Select>
        </FormControl>
      )
    },
    {
      field: 'puntaje',
      headerName: 'Puntaje',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={`${params.value} pts`} 
          size="small" 
          variant="outlined"
        />
      )
    }
  ];

  // Columnas para la tabla de no asistieron
  const columnasNoAsistieron = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'apellido_paterno', headerName: 'Apellido Paterno', flex: 1 },
    { field: 'apellido_materno', headerName: 'Apellido Materno', flex: 1 },
    {
      field: 'estado_asistencia',
      headerName: 'Estado',
      flex: 1,
      renderCell: (params) => (
        <FormControl size="small" fullWidth>
          <Select
            value={params.value}
            onChange={(e) => handleEstadoChange(params.row.id, e.target.value)}
            variant="outlined"
          >
            <MenuItem value="falta_justificada">
              <Chip 
                label="Falta Justificada" 
                size="small" 
                color="info" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem value="falta_no_justificada">
              <Chip 
                label="Falta No Justificada" 
                size="small" 
                color="error" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem value="asistencia_completa">
              <Chip 
                label="Asistencia Completa" 
                size="small" 
                color="success" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem value="retardo">
              <Chip 
                label="Retardo" 
                size="small" 
                color="warning" 
                sx={{ width: '100%' }}
              />
            </MenuItem>
          </Select>
        </FormControl>
      )
    },
    {
      field: 'puntaje',
      headerName: 'Puntaje',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={`${params.value} pts`} 
          size="small" 
          variant="outlined"
        />
      )
    }
  ];

  const handleTabChange = (_, newValue) => setTab(newValue);

  const downloadReport = async () => {
    try {
      const doc = new jsPDF('p', 'pt');
      
      // Capturar encabezado + gráfica
      const canvas = await html2canvas(headerChartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      // Agregar estadísticas detalladas
      doc.setFontSize(14);
      let y = imgHeight + 30;
      
      doc.text('Resumen de Asistencia:', 40, y);
      doc.setFontSize(12);
      y += 20;
      doc.text(`Total de Asistentes: ${asistieron.length}`, 60, y);
      y += 15;
      doc.text(`Total de Ausentes: ${noAsistieron.length}`, 60, y);
      y += 25;

      // Desglose por estado
      doc.setFontSize(14);
      doc.text('Desglose por Estado:', 40, y);
      doc.setFontSize(12);
      y += 20;

      const todosLosRegistros = [...asistieron, ...noAsistieron];
      const conteoEstados = todosLosRegistros.reduce((acc, curr) => {
        acc[curr.estado_asistencia] = (acc[curr.estado_asistencia] || 0) + 1;
        return acc;
      }, {});

      Object.entries(conteoEstados).forEach(([estado, cantidad]) => {
        doc.text(`${getEstadoLabel(estado)}: ${cantidad}`, 60, y);
        y += 15;
      });

      // Lista de no asistieron
      if (noAsistieron.length > 0) {
        y += 20;
        doc.setFontSize(14);
        doc.text('Lista de No Asistieron:', 40, y);
        doc.setFontSize(12);
        y += 20;
        
        noAsistieron.forEach((u, idx) => {
          const fullName = `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}`;
          const estado = getEstadoLabel(u.estado_asistencia);
          doc.text(`${idx + 1}. ${fullName} - ${estado}`, 60, y);
          y += 15;
        });
      }

      doc.save(`reporte_reunion_${reunionId}.pdf`);
      setSnackbar({ open: true, message: 'Reporte descargado', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al generar reporte', severity: 'error' });
    }
  };

  // Formatear fecha y hora
  const fmtFecha = dateStr =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
  const fmtHora = timeStr =>
    `${timeStr.slice(0, 5)} hr`;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Encabezado + gráfico */}
        <Box ref={headerChartRef}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5">
              {meeting?.title || '—'}
            </Typography>
            <Typography variant="body1">
              Fecha: {meeting ? fmtFecha(meeting.date) : '—'} &nbsp;|&nbsp;
              Hora: {meeting ? fmtHora(meeting.time) : '—'} &nbsp;|&nbsp;
              Tipo: {meeting?.type || '—'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Estado: {meeting && (
                <Chip 
                  label={meeting.status?.replace('_', ' ')} 
                  size="small" 
                  color="primary"
                />
              )}
            </Typography>
          </Box>

          <Box sx={{ width: '100%', height: 300, mb: 3 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieDataGrafica} // ✅ Usar pieDataGrafica en lugar de pieData
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieDataGrafica.map((entry, idx) => ( // ✅ Usar pieDataGrafica
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Pestañas */}
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label={`Asistieron (${asistieron.length})`} />
          <Tab label={`No asistieron (${noAsistieron.length})`} />
        </Tabs>

        {/* DataGrid */}
        <Box sx={{ mt: 2, height: 500 }}>
          <DataGrid
            rows={tab === 0 ? asistieron : noAsistieron}
            columns={tab === 0 ? columnasAsistieron : columnasNoAsistieron}
            getRowId={row => row.id}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': { 
                backgroundColor: 'rgb(2, 135, 209)',
                color: 'white'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          />
        </Box>

        {/* Botón PDF */}
        <Box sx={{ textAlign: 'right', mt: 2 }}>
          <Button variant="contained" onClick={downloadReport}>
            Descargar reporte (PDF)
          </Button>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}