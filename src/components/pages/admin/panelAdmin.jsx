// src/layout/panelAdmin.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Groups,
  EventAvailable,
  HowToVote,
  QuestionAnswer,
  Visibility,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../../../config/apiConfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PanelAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [añoParticipacion, setAñoParticipacion] = useState(currentYear);
  const [añoEstado, setAñoEstado] = useState(currentYear);
  const [añoActividades, setAñoActividades] = useState(currentYear);
  const [mesActividades, setMesActividades] = useState(currentMonth);

  // Estados para datos
  const [stats, setStats] = useState({
    totalAgremiados: { value: 0, change: 0, period: 'Cargando...' },
    reunionesActivas: { value: 0, change: 0, period: 'Cargando...' },
    encuestasActivas: { value: 0, change: 0, period: 'Cargando...' },
    votacionesActivas: { value: 0, change: 0, period: 'Cargando...' },
    preguntasPendientes: { value: 0, change: 0, period: 'Cargando...' }
  });

  const [participacionData, setParticipacionData] = useState([]);
  const [estadoActividades, setEstadoActividades] = useState([]);
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [empresa, setEmpresa] = useState(null);

  // Cargar estadísticas generales (cards superiores) - una sola vez al inicio
  useEffect(() => {
    loadEstadisticasGenerales();
    loadEmpresa();
  }, []);

  // Cargar participación mensual SOLO cuando cambia el año (NO al inicio)
  useEffect(() => {
    if (!loading) {
      loadParticipacionMensual();
    }
  }, [añoParticipacion]);

  // Cargar estado de actividades SOLO cuando cambia el año (NO al inicio)
  useEffect(() => {
    if (!loading) {
      loadEstadoActividades();
    }
  }, [añoEstado]);

  // Cargar actividades recientes SOLO cuando cambia año o mes (NO al inicio)
  useEffect(() => {
    if (!loading) {
      loadActividadesRecientes();
    }
  }, [añoActividades, mesActividades]);

  const loadEstadisticasGenerales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/estadisticas-generales`);
      const result = await response.json();

      if (result.success) {
        setStats({
          totalAgremiados: {
            value: result.data.totalAgremiados,
            change: 5.2,
            period: 'Desde el mes pasado'
          },
          reunionesActivas: {
            value: result.data.reunionesActivas,
            change: 14.3,
            period: 'Desde la semana pasada'
          },
          encuestasActivas: {
            value: result.data.encuestasActivas,
            change: -8.1,
            period: 'Desde el mes pasado'
          },
          votacionesActivas: {
            value: result.data.votacionesActivas,
            change: 6.7,
            period: 'Desde la semana pasada'
          },
          preguntasPendientes: {
            value: result.data.preguntasPendientes,
            change: -12.5,
            period: 'Desde ayer'
          }
        });
      }

      // Cargar también los datos iniciales de gráficas
      await Promise.all([
        loadParticipacionMensual(),
        loadEstadoActividades(),
        loadActividadesRecientes()
      ]);

    } catch (error) {
      console.error('Error al cargar estadísticas generales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipacionMensual = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/participacion-mensual?año=${añoParticipacion}`);
      const result = await response.json();

      if (result.success) {
        // Transformar datos para Recharts
        const chartData = result.data.map(item => ({
          name: item.nombre_mes.substring(0, 3), // Abreviatura del mes
          porcentaje: item.porcentaje,
          participaciones: item.participaciones_unicas
        }));
        setParticipacionData(chartData);
      }
    } catch (error) {
      console.error('Error al cargar participación mensual:', error);
    }
  };

  const loadEstadoActividades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/estado-actividades?año=${añoEstado}`);
      const result = await response.json();

      if (result.success) {
        setEstadoActividades(result.data);
      }
    } catch (error) {
      console.error('Error al cargar estado de actividades:', error);
    }
  };

  const loadActividadesRecientes = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/actividades-recientes?año=${añoActividades}&mes=${mesActividades}&limite=50`
      );
      const result = await response.json();

      if (result.success) {
        setActividadesRecientes(result.data);
      }
    } catch (error) {
      console.error('Error al cargar actividades recientes:', error);
    }
  };

  const loadEmpresa = async () => {
    try {
      const response = await fetch(`${API_URL}/api/datos-empresa`);
      const empresaData = await response.json();
      setEmpresa(empresaData[0] || null);
    } catch (error) {
      console.error('Error al cargar datos de empresa:', error);
    }
  };

  // Función para exportar CSV
  const exportarCSV = async (tipo) => {
    try {
      let url = `${API_URL}/api/dashboard/exportar-csv?tipo=${tipo}`;
      
      switch (tipo) {
        case 'participacion':
          url += `&año=${añoParticipacion}`;
          break;
        case 'estado':
          url += `&año=${añoEstado}`;
          break;
        case 'actividades':
          url += `&año=${añoActividades}&mes=${mesActividades}`;
          break;
      }

      // Descargar el archivo
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Obtener nombre de archivo del header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `reporte_${tipo}.csv`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el reporte');
    }
  };

  const StatCard = ({ title, value, change, period, icon, color }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {loading ? <CircularProgress size={24} /> : value.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {!loading && (
                <>
                  {change > 0 ? (
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  ) : (
                    <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={change > 0 ? 'success.main' : 'error.main'}
                    sx={{ mr: 0.5 }}
                  >
                    {change > 0 ? '+' : ''}{change}%
                  </Typography>
                </>
              )}
              <Typography variant="body2" color="textSecondary">
                {period}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
      case 'Programada':
      case 'En Curso':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Cerrada':
      case 'Cerrado':
      case 'Terminada':
        return 'info';
      case 'Pendiente':
      case 'pendiente':
        return 'error';
      case 'Programado':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleViewActivity = (activity) => {
    switch (activity.tipo) {
      case 'reunion':
        navigate('/admin_reuniones');
        break;
      case 'encuesta':
      case 'votación':
        navigate('/admin_encuestas');
        break;
      case 'rifa':
        navigate('/admin_rifas');
        break;
      case 'pregunta':
        navigate('/admin_preguntas');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando Panel Administrativo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {empresa ? `Panel Administrativo ${empresa.titulo_empresa || empresa.nombre_empresa}` : 'Panel Administrativo'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {empresa
            ? `Sistema de gestión sindical - ${empresa.titulo_empresa || empresa.nombre_empresa}`
            : 'Sistema de gestión sindical'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="TOTAL AGREMIADOS"
            value={stats.totalAgremiados.value}
            change={stats.totalAgremiados.change}
            period={stats.totalAgremiados.period}
            icon={<Groups sx={{ color: 'white', fontSize: 24 }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="REUNIONES ACTIVAS"
            value={stats.reunionesActivas.value}
            change={stats.reunionesActivas.change}
            period={stats.reunionesActivas.period}
            icon={<EventAvailable sx={{ color: 'white', fontSize: 24 }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="ENCUESTAS ACTIVAS"
            value={stats.encuestasActivas.value}
            change={stats.encuestasActivas.change}
            period={stats.encuestasActivas.period}
            icon={<HowToVote sx={{ color: 'white', fontSize: 24 }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="VOTACIONES ACTIVAS"
            value={stats.votacionesActivas.value}
            change={stats.votacionesActivas.change}
            period={stats.votacionesActivas.period}
            icon={<HowToVote sx={{ color: 'white', fontSize: 24 }} />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="PREGUNTAS PENDIENTES"
            value={stats.preguntasPendientes.value}
            change={stats.preguntasPendientes.change}
            period={stats.preguntasPendientes.period}
            icon={<QuestionAnswer sx={{ color: 'white', fontSize: 24 }} />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Activity Chart con RECHARTS */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Participación Mensual en Actividades Sindicales
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Botón Exportar CSV */}
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => exportarCSV('participacion')}
                    variant="outlined"
                  >
                    Exportar
                  </Button>
                  {/* Filtro de Año */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Año</InputLabel>
                    <Select
                      value={añoParticipacion}
                      label="Año"
                      onChange={(e) => setAñoParticipacion(e.target.value)}
                    >
                      {[2023, 2024, 2025, 2026].map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Gráfica con Recharts */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={participacionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Porcentaje %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'porcentaje') return [`${value.toFixed(1)}%`, 'Participación'];
                      if (name === 'participaciones') return [value, 'Usuarios únicos'];
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="porcentaje" fill="#2196f3" name="Participación %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Activities Status - SIN botón "Ver Estadísticas" */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Estado de Actividades
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Botón Exportar CSV */}
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => exportarCSV('estado')}
                    variant="outlined"
                  >
                    Exportar
                  </Button>
                  {/* Filtro de Año */}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={añoEstado}
                      onChange={(e) => setAñoEstado(e.target.value)}
                      displayEmpty
                    >
                      {[2023, 2024, 2025, 2026].map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {estadoActividades.map((actividad, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {actividad.nombre}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {actividad.completadas} de {actividad.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={actividad.total > 0 ? (actividad.completadas / actividad.total) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: actividad.color,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Recent Activity Table - CON SCROLL y filtros año/mes */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Actividades Recientes del Sindicato
                </Typography>
                {/* Botón Exportar y Filtros de Año y Mes */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => exportarCSV('actividades')}
                    variant="outlined"
                  >
                    Exportar
                  </Button>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Año</InputLabel>
                    <Select
                      value={añoActividades}
                      label="Año"
                      onChange={(e) => setAñoActividades(e.target.value)}
                    >
                      {[2023, 2024, 2025, 2026].map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Mes</InputLabel>
                    <Select
                      value={mesActividades}
                      label="Mes"
                      onChange={(e) => setMesActividades(e.target.value)}
                    >
                      {[
                        { value: 1, label: 'Enero' },
                        { value: 2, label: 'Febrero' },
                        { value: 3, label: 'Marzo' },
                        { value: 4, label: 'Abril' },
                        { value: 5, label: 'Mayo' },
                        { value: 6, label: 'Junio' },
                        { value: 7, label: 'Julio' },
                        { value: 8, label: 'Agosto' },
                        { value: 9, label: 'Septiembre' },
                        { value: 10, label: 'Octubre' },
                        { value: 11, label: 'Noviembre' },
                        { value: 12, label: 'Diciembre' }
                      ].map(mes => (
                        <MenuItem key={mes.value} value={mes.value}>{mes.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Tabla con SCROLL interno */}
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Responsable</TableCell>
                      <TableCell>Actividad</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {actividadesRecientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No hay actividades para el período seleccionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      actividadesRecientes.map((activity) => (
                        <TableRow key={activity.id} hover>
                          <TableCell>{activity.id}</TableCell>
                          <TableCell>
                            <Chip
                              label={activity.tipo}
                              size="small"
                              color="default"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>{activity.responsable}</TableCell>
                          <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activity.actividad}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={activity.estado}
                              color={getStatusColor(activity.estado)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{activity.fecha_formato}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewActivity(activity)}
                            >
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Acciones Rápidas
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EventAvailable />}
                  fullWidth
                  size="small"
                  onClick={() => navigate('/admin_reuniones')}
                >
                  Nueva Reunión
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HowToVote />}
                  fullWidth
                  size="small"
                  onClick={() => navigate('/admin_encuestas')}
                >
                  Nueva Encuesta
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HowToVote />}
                  fullWidth
                  size="small"
                  onClick={() => navigate('/admin_rifas')}
                >
                  Nueva Rifa
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QuestionAnswer />}
                  fullWidth
                  size="small"
                  onClick={() => navigate('/admin_preguntas')}
                >
                  Ver Preguntas
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PanelAdmin;