// src/pages/admin/EncuestasyVotaciones/admin_Predicciones.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const AdminPredicciones = () => {
  const navigate = useNavigate();
  
  // Estados para datos ML
  const [datos, setDatos] = useState(null);
  const [datosCluster, setDatosCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // 🚀 CONFIGURACIÓN DE LA API - CAMBIAR POR TU URL DE PRODUCCIÓN
  const API_BASE = 'https://modelo1-mbg1.onrender.com'; // Tu URL de Render/producción
  // const API_BASE = 'http://localhost:5000'; // Para desarrollo local

  // 🔍 FUNCIÓN PARA VERIFICAR ESTADO DEL SISTEMA
  const verificarEstado = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status`);
      const data = await response.json();
      setSystemStatus(data);
      return data.modelo_ml && data.bd_config;
    } catch (error) {
      console.error('Error verificando estado:', error);
      setError('Error de conexión con el servidor ML');
      return false;
    }
  };

  // 📊 FUNCIÓN PARA CARGAR DATOS PRINCIPALES
  const cargarDatos = async (mostrarNotificacion = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar estado del sistema primero
      const sistemaOK = await verificarEstado();
      
      if (!sistemaOK) {
        setError('Sistema ML no disponible. Modelo o BD no configurados.');
        setLoading(false);
        return;
      }

      // Cargar datos principales
      const responseDatos = await fetch(`${API_BASE}/api/datos`);
      const datosResponse = await responseDatos.json();
      
      if (!datosResponse.success) {
        throw new Error(datosResponse.error || 'Error obteniendo datos principales');
      }

      // Cargar datos de clustering/clasificación
      const responseCluster = await fetch(`${API_BASE}/api/clustering`);
      const clusterResponse = await responseCluster.json();
      
      if (!clusterResponse.success) {
        throw new Error(clusterResponse.error || 'Error obteniendo datos de clustering');
      }

      // ✅ PROCESAR DATOS SIMPLIFICADOS
      setDatos(datosResponse);
      setDatosCluster(clusterResponse);
      setLoading(false);
      
      if (mostrarNotificacion) {
        setNotification({
          open: true,
          message: `🤖 Datos actualizados: ${datosResponse.total} usuarios procesados`,
          type: 'success'
        });
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(error.message);
      setLoading(false);
      
      if (mostrarNotificacion) {
        setNotification({
          open: true,
          message: `❌ Error: ${error.message}`,
          type: 'error'
        });
      }
    }
  };

  // 🔄 CARGAR DATOS AL INICIAR
  useEffect(() => {
    cargarDatos();
  }, []);

  // 📈 PREPARAR DATOS PARA LA GRÁFICA DE CLASIFICACIÓN POR RENDIMIENTO
  const getChartData = () => {
    if (!datosCluster?.distribucion_categorias) return null;

    const categorias = datosCluster.distribucion_categorias;

    return {
      labels: ['🟢 Excelente', '🔵 Bueno', '🟡 Regular', '🔴 Deficiente'],
      datasets: [
        {
          data: [
            categorias.EXCELENTE,
            categorias.BUENO,
            categorias.REGULAR,
            categorias.DEFICIENTE
          ],
          backgroundColor: ['#28a745', '#007bff', '#ffc107', '#dc3545'],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label} (${value})`, // Mostrar cantidad en la leyenda
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 0,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: 'Clasificación por Sistema de Puntajes SUTUTEH'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue || context.raw;
            return `${label}: ${value} usuarios`;
          }
        }
      }
    }
  };

  // 🎨 COMPONENTES UI
  const StatCard = ({ icon: Icon, title, value, subtitle, badge, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: color || '#4299e1'
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 2, px: 1.5 }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip 
            label={badge} 
            size="small" 
            sx={{ 
              backgroundColor: color || '#4299e1', 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: '0.65rem',
              height: '20px'
            }} 
          />
        </Box>
        <Icon sx={{ fontSize: 36, mb: 1, color: color || '#4299e1' }} />
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${color || '#4299e1'}, #333)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2rem'
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7, fontWeight: 500, display: 'block' }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const UserItem = ({ user }) => {
    // 🎯 DETERMINAR CATEGORÍA BASADA EN PREDICCIÓN SIMPLIFICADA
    const getCategory = (usuario) => {
      if (!usuario.en_riesgo) {
        // Usuario que SÍ asistirá
        if (usuario.probabilidad >= 0.80) {
          return {
            label: 'ALTAMENTE COMPROMETIDO',
            color: '#2E7D32',
            bgColor: 'rgba(46, 125, 50, 0.1)',
            icon: '⭐'
          };
        } else if (usuario.probabilidad >= 0.65) {
          return {
            label: 'COMPROMETIDO',
            color: '#388E3C',
            bgColor: 'rgba(56, 142, 60, 0.1)',
            icon: '✨'
          };
        } else {
          return {
            label: 'PARTICIPATIVO',
            color: '#FF8F00',
            bgColor: 'rgba(255, 143, 0, 0.1)',
            icon: '🔸'
          };
        }
      } else {
        // Usuario en riesgo (NO asistirá)
        return {
          label: 'RIESGO DE FALTAR',
          color: '#D32F2F',
          bgColor: 'rgba(211, 47, 47, 0.1)',
          icon: '⚠️'
        };
      }
    };

    const category = getCategory(user);

    return (
      <ListItem
        sx={{
          backgroundColor: category.bgColor,
          borderRadius: 2,
          mb: 1,
          transition: 'all 0.2s ease',
          border: `1px solid ${category.color}20`,
          '&:hover': {
            backgroundColor: `${category.color}15`,
            transform: 'translateX(5px)',
            borderColor: `${category.color}40`
          }
        }}
      >
        <ListItemIcon>
          <Avatar
            sx={{
              bgcolor: category.color,
              width: 35,
              height: 35,
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            {user.nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || `U${user.id}`}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {user.nombre || `Usuario ${user.id}`}
              </Typography>
              <Chip
                label={`${category.icon} ${category.label}`}
                size="small"
                sx={{
                  backgroundColor: category.color,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  height: '20px'
                }}
              />
            </Box>
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              {user.cluster}
            </Typography>
          }
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={user.en_riesgo ? 'NO Asistirá' : 'SÍ Asistirá'}
            size="small"
            color={user.en_riesgo ? 'error' : 'success'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </ListItem>
    );
  };

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          🤖 Cargando sistema de predicción SUTUTEH...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conectando con modelo ML y base de datos
        </Typography>
      </Container>
    );
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin_reuniones')}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Volver a Reuniones
        </Button>

        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => cargarDatos(true)}>
              Reintentar
            </Button>
          }
        >
          <Typography variant="h6">❌ Sistema SUTUTEH No Disponible</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>

        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: '#e53e3e', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Error de conexión con el sistema de predicción
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Verifica que el servidor esté funcionando: {API_BASE}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={() => cargarDatos(true)}
            sx={{ mt: 2 }}
          >
            🔄 Reconectar
          </Button>
        </Paper>
      </Container>
    );
  }

  // ✅ SUCCESS STATE - MOSTRAR DATOS
  if (!datos || !datosCluster) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, textAlign: 'center' }}>
        <Typography>No hay datos disponibles</Typography>
      </Container>
    );
  }

  // 🎯 SEPARAR USUARIOS SEGÚN PREDICCIÓN SIMPLIFICADA
  const usuariosAsistiran = datos.usuarios.filter(u => !u.en_riesgo);  // SÍ asistirán
  const usuariosNoAsistiran = datos.usuarios.filter(u => u.en_riesgo); // NO asistirán

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header con controles */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin_reuniones')}
          variant="outlined"
        >
          Volver a Reuniones
        </Button>
        
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => cargarDatos(true)}
          variant="contained"
          color="primary"
        >
          🔄 Actualizar Predicción
        </Button>
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: "bold", 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1 
          }}
        >
          <SmartToyIcon color="primary" sx={{ fontSize: 32 }} />
          Sistema de Predicción SUTUTEH
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {datos.total} usuarios analizados con modelo ML
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={GroupIcon}
            title="Total Usuarios"
            value={datos.total}
            subtitle="Analizados"
            badge="TOTAL"
            color="#4299e1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircleIcon}
            title="Sí Asistirán"
            value={datos.asistiran}
            subtitle="Predicción Positiva"
            badge="✅"
            color="#28a745"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={WarningIcon}
            title="No Asistirán"
            value={datos.no_asistiran}
            subtitle="En Riesgo"
            badge="⚠️"
            color="#dc3545"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={SmartToyIcon}
            title="Modelo ML"
            value={datos.modelo_activo ? "✅" : "❌"}
            subtitle="Estado del Sistema"
            badge="ML"
            color={datos.modelo_activo ? "#28a745" : "#dc3545"}
          />
        </Grid>
      </Grid>

      {/* Gráfica de Clasificación por Rendimiento */}
      {getChartData() && (
        <Paper sx={{ mb: 3, p: 2, elevation: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            📊 Clasificación por Rendimiento
          </Typography>
          <Box sx={{ height: 400, position: 'relative' }}>
            <Pie data={getChartData()} options={chartOptions} />
          </Box>
        </Paper>
      )}

      {/* Análisis de Usuarios en Dos Columnas */}
      <Paper sx={{ p: 2, elevation: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          👥 Análisis Individual
        </Typography>

        <Grid container spacing={2}>
          {/* Columna: SÍ Asistirán */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 1.5, backgroundColor: 'rgba(40, 167, 69, 0.05)', border: '2px solid #28a745' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                  pb: 0.5,
                  borderBottom: '2px solid #28a745',
                  color: '#28a745',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                ✅ Sí Asistirán ({usuariosAsistiran.length})
              </Typography>
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {usuariosAsistiran.length > 0 ? (
                  usuariosAsistiran
                    .sort((a, b) => b.probabilidad - a.probabilidad) // Ordenar por probabilidad
                    .map((user) => (
                      <UserItem key={user.id} user={user} />
                    ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    No hay usuarios que asistirán según el modelo ML
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Columna: NO Asistirán */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 1.5, backgroundColor: 'rgba(220, 53, 69, 0.05)', border: '2px solid #dc3545' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                  pb: 0.5,
                  borderBottom: '2px solid #dc3545',
                  color: '#dc3545',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <ErrorIcon sx={{ fontSize: 16 }} />
                ❌ No Asistirán ({usuariosNoAsistiran.length})
              </Typography>
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {usuariosNoAsistiran.length > 0 ? (
                  usuariosNoAsistiran.map((user) => (
                    <UserItem key={user.id} user={user} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    ¡Excelente! Todos los usuarios tienen predicción positiva
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Status del Sistema */}
      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          🤖 Sistema SUTUTEH funcionando correctamente • 
          Modelo ML: {systemStatus?.modelo_ml ? "✅ Activo" : "❌ Inactivo"} • 
          Base de Datos: {systemStatus?.bd_config ? "✅ Conectada" : "❌ Error"}
        </Typography>
      </Alert>

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Container>
  );
};

export default AdminPredicciones;