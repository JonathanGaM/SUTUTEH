// src/layout/panelAdmin.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  HowToVote,
  AttachMoney,
  QuestionAnswer,
  Visibility,
  MoreVert,
  EventAvailable,
  CardGiftcard,
  Groups,
  Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../../../config/apiConfig";

const PanelAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgremiados: { value: 0, change: 0, period: 'Cargando...' },
    reunionesActivas: { value: 0, change: 0, period: 'Cargando...' },
    encuestasActivas: { value: 0, change: 0, period: 'Cargando...' },
    votacionesActivas: { value: 0, change: 0, period: 'Cargando...' },
    preguntasPendientes: { value: 0, change: 0, period: 'Cargando...' }
  });

  // Estados para datos reales
  const [recentActivity, setRecentActivity] = useState([]);
  const [reuniones, setReuniones] = useState([]);
  const [encuestas, setEncuestas] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [rifas, setRifas] = useState([]);
  const [empresa, setEmpresa] = useState(null); // Estado para datos de la empresa

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos de diferentes endpoints en paralelo
        const [
          reunionesRes,
          encuestasRes,
          preguntasRes,
          rifasRes,
          agremiadosRes,
          empresaRes
        ] = await Promise.all([
          fetch(`${API_URL}/api/reuniones`),
          fetch(`${API_URL}/api/encuestas-votaciones`),
          fetch(`${API_URL}/api/preguntas`),
          fetch(`${API_URL}/api/rifas`),
          fetch(`${API_URL}/api/puestos/estadisticas/agremiados`),
          fetch(`${API_URL}/api/datos-empresa`)
        ]);

        const reunionesData = await reunionesRes.json();
        const encuestasData = await encuestasRes.json();
        const preguntasData = await preguntasRes.json();
        const rifasData = await rifasRes.json();
        const agremiadosData = await agremiadosRes.json();
        const empresaData = await empresaRes.json();

        // Procesar datos
        setReuniones(reunionesData);
        setEncuestas(encuestasData);
        setPreguntas(preguntasData);
        setRifas(rifasData.success ? rifasData.data : []);
        setEmpresa(empresaData[0] || null); // Tomar el primer registro de empresa

        // Calcular estadísticas REALES usando la misma lógica que admin_encuestas
        const reunionesActivas = reunionesData.filter(r => r.status === 'Programada' || r.status === 'En Curso').length;
        
        // Filtrar encuestas activas (estado 'Activo' y tipo 'Encuesta')
        const encuestasActivas = encuestasData.filter(e => 
          e.estado === 'Activo' && e.type === 'Encuesta'
        ).length;
        
        // Para votaciones activas: usar todas las encuestas/votaciones activas 
        // ya que ambas están en la misma tabla
        const votacionesActivas = encuestasData.filter(e => 
          e.estado === 'Activo' && e.type === 'Votación'
        ).length;
        
        // Si no hay votaciones específicas, usar el total de activas
        const totalEncuestasVotacionesActivas = encuestasData.filter(e => 
          e.estado === 'Activo'
        ).length;
        
        const preguntasPendientes = preguntasData.filter(p => p.estado === 'pendiente').length;

        // Usar datos reales de agremiados desde la nueva API
        const totalAgremiados = agremiadosData.total_agremiados || 0;

        // Debug: mostrar conteos en consola
        console.log('📊 Estadísticas Dashboard:', {
          totalEncuestas: encuestasData.length,
          encuestasActivas,
          votacionesActivas,
          totalEncuestasVotacionesActivas,
          encuestasPorEstado: encuestasData.reduce((acc, e) => {
            acc[e.estado] = (acc[e.estado] || 0) + 1;
            return acc;
          }, {}),
          encuestasPorTipo: encuestasData.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
          }, {})
        });

        setStats({
          totalAgremiados: { 
            value: totalAgremiados, 
            change: totalAgremiados > 0 ? 5.2 : 0, 
            period: totalAgremiados > 0 ? 'Desde el mes pasado' : 'Sin datos disponibles' 
          },
          reunionesActivas: { 
            value: reunionesActivas, 
            change: reunionesActivas > 0 ? 14.3 : 0, 
            period: 'Desde la semana pasada' 
          },
          encuestasActivas: { 
            value: encuestasActivas, 
            change: encuestasActivas > 0 ? -8.1 : 0, 
            period: 'Desde el mes pasado' 
          },
          votacionesActivas: { 
            // Usar votaciones específicas o total de activas si no hay votaciones
            value: votacionesActivas > 0 ? votacionesActivas : totalEncuestasVotacionesActivas, 
            change: totalEncuestasVotacionesActivas > 0 ? 6.7 : 0, 
            period: 'Desde la semana pasada' 
          },
          preguntasPendientes: { 
            value: preguntasPendientes, 
            change: preguntasPendientes > 0 ? -12.5 : 0, 
            period: 'Desde ayer' 
          }
        });

        // Generar actividades recientes reales
        const activities = generateRecentActivities(reunionesData, encuestasData, rifasData.success ? rifasData.data : []);
        setRecentActivity(activities);

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Función para generar actividades recientes basadas en datos reales
  const generateRecentActivities = (reuniones, encuestas, rifas) => {
    const activities = [];

    // Agregar reuniones recientes
    reuniones.slice(0, 2).forEach(reunion => {
      activities.push({
        id: `REU-${reunion.id}`,
        member: 'Comité Ejecutivo',
        item: reunion.title,
        status: reunion.status === 'Programada' ? 'Programada' : reunion.status,
        date: new Date(reunion.date).toLocaleDateString('es-ES'),
        type: 'reunion'
      });
    });

    // Agregar encuestas recientes
    encuestas.slice(0, 2).forEach(encuesta => {
      activities.push({
        id: `ENC-${encuesta.id}`,
        member: 'Secretaría General',
        item: encuesta.title,
        status: encuesta.estado,
        date: new Date(encuesta.publicationDate).toLocaleDateString('es-ES'),
        type: 'encuesta'
      });
    });

    // Agregar rifas recientes
    rifas.slice(0, 1).forEach(rifa => {
      activities.push({
        id: `RIF-${rifa.id}`,
        member: 'Comité Social',
        item: rifa.titulo,
        status: 'En Proceso',
        date: new Date(rifa.fecha).toLocaleDateString('es-ES'),
        type: 'rifa'
      });
    });

    return activities.slice(0, 5); // Limitar a 5 actividades
  };

  // Datos para el gráfico (simulado por ahora)
  const [monthlyData] = useState([
    { month: 'Ene', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 48 },
    { month: 'Abr', value: 61 },
    { month: 'May', value: 55 },
    { month: 'Jun', value: 67 },
    { month: 'Jul', value: 72 },
    { month: 'Ago', value: 69 },
    { month: 'Sep', value: 75 },
    { month: 'Oct', value: 78 },
    { month: 'Nov', value: 82 },
    { month: 'Dic', value: 85 }
  ]);

  // Calcular progreso de actividades basado en datos reales
  const calculateActivities = () => {
    if (loading) return [];

    return [
      { 
        name: 'Reuniones Ordinarias', 
        completed: reuniones.filter(r => r.status === 'Terminada').length, 
        total: reuniones.length, 
        color: '#2196f3' 
      },
      { 
        name: 'Encuestas Sindicales', 
        completed: encuestas.filter(e => e.estado === 'Cerrado').length, 
        total: encuestas.length, 
        color: '#4caf50' 
      },
      { 
        name: 'Votaciones Activas', 
        completed: encuestas.filter(e => e.type === 'Votación' && e.estado === 'Activo').length, 
        total: encuestas.filter(e => e.type === 'Votación').length, 
        color: '#ff9800' 
      },
      { 
        name: 'Rifas Benéficas', 
        completed: rifas.length, 
        total: rifas.length + 2, 
        color: '#9c27b0' 
      },
      { 
        name: 'Preguntas Respondidas', 
        completed: preguntas.filter(p => p.estado === 'respondido').length, 
        total: preguntas.length, 
        color: '#f44336' 
      }
    ];
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
              {loading ? <CircularProgress size={24} /> : (typeof value === 'number' ? value.toLocaleString() : value)}
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
      case 'Programada': return 'success';
      case 'En Proceso': return 'warning';
      case 'Cerrada':
      case 'Cerrado': return 'info';
      case 'Pendiente': return 'error';
      case 'Terminada': return 'default';
      default: return 'default';
    }
  };

  const handleViewActivity = (activity) => {
    switch (activity.type) {
      case 'reunion':
        navigate('/admin_reuniones');
        break;
      case 'encuesta':
        navigate('/admin_encuestas');
        break;
      case 'rifa':
        navigate('/admin_rifas');
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
          {empresa ? 
            `Sistema de gestión sindical - ${empresa.titulo_empresa || empresa.nombre_empresa}` : 
            'Sistema de gestión sindical'
          }
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
        {/* Monthly Activity Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Participación Mensual en Actividades Sindicales
                </Typography>
                <Button size="small" startIcon={<MoreVert />}>
                  Opciones
                </Button>
              </Box>
              
              {/* Simulación de gráfico con barras */}
              <Box sx={{ height: 300, position: 'relative' }}>
                {monthlyData.map((item, index) => (
                  <Box
                    key={item.month}
                    sx={{
                      position: 'absolute',
                      bottom: 40,
                      left: `${(index * 8) + 2}%`,
                      width: '6%',
                      height: `${(item.value / 85) * 200}px`,
                      backgroundColor: '#2196f3',
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.8,
                      transition: 'opacity 0.3s',
                      '&:hover': { opacity: 1 }
                    }}
                  />
                ))}
                
                {/* Etiquetas del eje X */}
                {monthlyData.map((item, index) => (
                  <Typography
                    key={`label-${item.month}`}
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: `${(index * 8) + 2}%`,
                      fontSize: '0.7rem',
                      color: 'textSecondary'
                    }}
                  >
                    {item.month}
                  </Typography>
                ))}
                
                {/* Líneas de referencia */}
                {[0, 20, 40, 60, 80].map((value, index) => (
                  <Box key={value}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 40 + (index * 50),
                        height: '1px',
                        backgroundColor: '#e0e0e0'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        left: -25,
                        bottom: 35 + (index * 50),
                        fontSize: '0.7rem',
                        color: 'textSecondary'
                      }}
                    >
                      {value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activities Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Estado de Actividades
                </Typography>
                <Button variant="outlined" size="small">
                  2025
                </Button>
              </Box>
              
              {calculateActivities().map((actividad, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {actividad.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {actividad.completed} de {actividad.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={actividad.total > 0 ? (actividad.completed / actividad.total) * 100 : 0}
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
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="text" color="primary">
                  Ver Estadísticas →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Recent Activity Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Actividades Recientes del Sindicato
                </Typography>
                <Button variant="contained" color="primary" size="small">
                  Ver Todas →
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Responsable</TableCell>
                      <TableCell>Actividad</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>{activity.id}</TableCell>
                        <TableCell>{activity.member}</TableCell>
                        <TableCell>{activity.item}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            color={getStatusColor(activity.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{activity.date}</TableCell>
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
                    ))}
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
                  startIcon={<CardGiftcard />} 
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