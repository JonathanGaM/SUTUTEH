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
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const COLORS = ['#0088FE', '#FF8042'];

export default function AsistenciaReuniones() {
  const { id: reunionId } = useParams();
  const [tab, setTab] = useState(0);
  const [meeting, setMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const headerChartRef = useRef();
  const containerRef = useRef();

  // 1) Cargar datos de la reunión y asistencia
  useEffect(() => {
    // Info de la reunión
    axios.get(`http://localhost:3001/api/reuniones/${reunionId}`)
      .then(({ data }) => setMeeting(data))
      .catch(err => console.error('Error al cargar reunión', err));

    // Lista de asistencia (campo `asistio: boolean`)
    axios.get(`http://localhost:3001/api/reuniones/${reunionId}/asistencia`)
      .then(({ data }) => setAttendance(data))
      .catch(err => console.error('Error al cargar asistencia', err));
  }, [reunionId]);

  // 2) Separar asistentes y ausentes
  const asistieron    = attendance.filter(u => u.asistio);
  const noAsistieron  = attendance.filter(u => !u.asistio);

  // Datos para el pastel
  const pieData = [
    { name: 'Asistieron',     value: asistieron.length },
    { name: 'No asistieron',  value: noAsistieron.length }
  ];

  const columns = [
    { field: 'nombre',          headerName: 'Nombre',          flex: 1 },
    { field: 'apellidoPaterno', headerName: 'Apellido Paterno', flex: 1 },
    { field: 'apellidoMaterno', headerName: 'Apellido Materno', flex: 1 }
  ];

  const handleTabChange = (_, newValue) => setTab(newValue);

  const downloadReport = async () => {
    try {
      const doc = new jsPDF('p', 'pt');
      // capturar encabezado + gráfica
      const canvas = await html2canvas(headerChartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pageWidth  = doc.internal.pageSize.getWidth();
      const imgHeight  = (canvas.height * pageWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      // lista de ausentes en el PDF
      doc.setFontSize(14);
      let y = imgHeight + 20;
      doc.text('No asistieron:', 40, y);
      doc.setFontSize(12);
      noAsistieron.forEach((u, idx) => {
        y += 18;
        const fullName = `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`;
        doc.text(`${idx + 1}. ${fullName}`, 60, y);
      });

      doc.save(`reporte_reunion_${reunionId}.pdf`);
      setSnackbar({ open: true, message: 'Reporte descargado', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al generar reporte', severity: 'error' });
    }
  };

  // Formatear fecha y hora para mostrar en el encabezado
  const fmtFecha = dateStr =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      day:   'numeric',
      month: 'long',
      year:  'numeric'
    });
  const fmtHora  = timeStr =>
    `${timeStr.slice(0, 5)} hr`;

  return (
    <Container maxWidth="md" sx={{ mt:4, mb:4 }}>
      <Paper ref={containerRef} sx={{ p:3 }}>
        {/* encabezado + gráfico */}
        <Box ref={headerChartRef}>
          <Box sx={{ textAlign: 'center', mb:3 }}>
            <Typography variant="h5">
              {meeting?.title || '—'}
            </Typography>
            <Typography variant="body1">
              Fecha: {meeting ? fmtFecha(meeting.date) : '—'} &nbsp;|&nbsp;
              Hora:  {meeting ? fmtHora(meeting.time) : '—'} &nbsp;|&nbsp;
              Tipo:  {meeting?.type || '—'}
            </Typography>
          </Box>

          <Box sx={{ width:'100%', height:300, mb:3 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* pestañas */}
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label={`Asistieron (${asistieron.length})`} />
          <Tab label={`No asistieron (${noAsistieron.length})`} />
        </Tabs>

        {/* DataGrid */}
        <Box sx={{ mt:2, height:400 }}>
          <DataGrid
            rows={tab === 0 ? asistieron : noAsistieron}
            columns={columns}
            getRowId={row => row.id}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }
            }}
          />
        </Box>

        {/* botón PDF */}
        <Box sx={{ textAlign:'right', mt:2 }}>
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
        <Alert severity={snackbar.severity} sx={{ width:'100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
