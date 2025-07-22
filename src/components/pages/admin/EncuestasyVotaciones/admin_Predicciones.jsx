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
import { Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const AdminPredicciones = () => {
  const navigate = useNavigate();
  
  // Estados para datos ML
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // Configuración de la API - CAMBIAR POR TU URL
  const API_BASE = 'https://modelo1-mbg1.onrender.com'; // Tu URL de Render

  // 🚀 FUNCIÓN PARA VERIFICAR ESTADO ML
  const verificarEstadoML = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status`);
      const data = await response.json();
      setMlStatus(data);
      return data.modelo_ml?.sistema_ml_completo || false;
    } catch (error) {
      console.error('Error verificando estado ML:', error);
      setError('Error de conexión con el servidor');
      return false;
    }
  };

  // 🤖 FUNCIÓN PARA CARGAR DATOS ML
  const cargarDatosML = async (mostrarNotificacion = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar estado ML primero
      const mlDisponible = await verificarEstadoML();
      
      if (!mlDisponible) {
        setError('Sistema ML no disponible. Los archivos .pkl son requeridos.');
        setLoading(false);
        return;
      }

      // Cargar datos completos ML
      const response = await fetch(`${API_BASE}/api/datos-completos-ml`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Respuesta no exitosa del servidor');
      }

      // ✅ PROCESAR DATOS ML
      setMlData(data);
      setLoading(false);
      
      if (mostrarNotificacion) {
        setNotification({
          open: true,
          message: '🤖 Datos ML actualizados exitosamente',
          type: 'success'
        });
      }

    } catch (error) {
      console.error('Error cargando datos ML:', error);
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
    cargarDatosML();
  }, []);

  // 📊 PREPARAR DATOS PARA LA GRÁFICA CON COLORES CORRECTOS
  const getChartData = () => {
    if (!mlData?.clusters) return null;

    // Mapear colores según el orden específico del HTML
    const getColorForCluster = (clusterName) => {
      switch(clusterName) {
        case 'Activistas Comprometidos': return '#38a169';      // Verde
        case 'Inactivos Críticos': return '#e53e3e';           // Rojo  
        case 'Ocasionales Moderados': return '#d69e2e';        // Amarillo
        case 'Participativos Regulares': return '#4299e1';     // Azul
        default: return '#718096';
      }
    };

    const clusterNames = Object.keys(mlData.clusters);
    const clusterValues = Object.values(mlData.clusters);
    const colors = clusterNames.map(name => getColorForCluster(name));

    return {
      labels: clusterNames.map(k => k), // Sin (ML)
      datasets: [
        {
          data: clusterValues,
          backgroundColor: colors,
          borderWidth: 0
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'Clusters generados por modelo'
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
              backgroundColor: '#38a169', 
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

  const ClusterCard = ({ name, count }) => {
    const colors = {
      'Activistas Comprometidos': 'linear-gradient(135deg, #38a169, #48bb78)',
      'Participativos Regulares': 'linear-gradient(135deg, #4299e1, #63b3ed)',
      'Ocasionales Moderados': 'linear-gradient(135deg, #d69e2e, #ecc94b)',
      'Inactivos Críticos': 'linear-gradient(135deg, #e53e3e, #f56565)'
    };

    return (
      <Card
        sx={{
          background: colors[name],
          color: 'white',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
          }
        }}
        onClick={() => {
          // Mostrar info simple del cluster
          const usuarios = mlData.usuarios.filter(u => u.cluster === name);
          const promedioProb = usuarios.length > 0 
            ? usuarios.reduce((sum, u) => sum + u.probabilidad_asistencia, 0) / usuarios.length 
            : 0;
          
          setNotification({
            open: true,
            message: `🎯 ${name}: ${count} usuarios, Probabilidad promedio: ${(promedioProb * 100).toFixed(1)}%`,
            type: 'info'
          });
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {count}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
            {name}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const UserItem = ({ user }) => {
    const getProbabilityChipColor = (prob) => {
      if (prob >= 0.70) return 'success';     // Verde para 70%+
      if (prob >= 0.50) return 'warning';     // Amarillo para 50%-69%
      return 'error';                         // Rojo para <50% (riesgo real)
    };

    // 🎯 FUNCIÓN PARA DETERMINAR CATEGORÍA - CORREGIDA SIN ROJO EN "SÍ ASISTIRÁN"
    const getUserCategory = (prob) => {
      // VERDE: Alta probabilidad de asistir (70%-100%)
      if (prob >= 0.85) return { 
        label: 'ALTAMENTE COMPROMETIDO', 
        color: '#2E7D32', 
        bgColor: 'rgba(46, 125, 50, 0.1)',
        icon: '⭐'
      };
      if (prob >= 0.70) return { 
        label: 'COMPROMETIDO', 
        color: '#388E3C', 
        bgColor: 'rgba(56, 142, 60, 0.1)',
        icon: '✨'
      };
      
      // AMARILLO: Para usuarios 50%-69% (en lista "Sí Asistirán")
      if (prob >= 0.50) return { 
        label: 'PARTICIPATIVO', 
        color: '#FF8F00',                    // Amarillo fuerte
        bgColor: 'rgba(255, 143, 0, 0.1)',  // Fondo amarillo
        icon: '🔸'                           // Ícono amarillo
      };
      
      // ROJO: Solo para usuarios <50% (lista "No Asistirán")
      return { 
        label: 'RIESGO DE FALTAR', 
        color: '#D32F2F',
        bgColor: 'rgba(211, 47, 47, 0.1)',
        icon: '⚠️'
      };
    };

    const category = getUserCategory(user.probabilidad_asistencia);

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
            {user.nombre_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || `U${user.usuario_id}`}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {user.en_riesgo ? '' : ''}{user.nombre_completo || `Usuario ${user.usuario_id}`}
              </Typography>
              {/* 🎯 META/BADGE DE CATEGORÍA */}
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
              {user.rol} • {user.cluster}
            </Typography>
          }
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={user.probabilidad_texto}
            size="small"
            color={getProbabilityChipColor(user.probabilidad_asistencia)}
            sx={{ fontWeight: 'bold' }}
          />
          <Typography variant="caption" sx={{ color: category.color, fontWeight: 'bold' }}>
            {(user.probabilidad_asistencia * 100).toFixed(0)}%
          </Typography>
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
          🤖 Cargando modelo ML...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Procesando archivos .pkl y ejecutando predicciones
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
            <Button color="inherit" size="small" onClick={() => cargarDatosML(true)}>
              Reintentar
            </Button>
          }
        >
          <Typography variant="h6">❌ Sistema ML No Disponible</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>

        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: '#e53e3e', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Los archivos .pkl son requeridos para el funcionamiento del sistema
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Archivos necesarios: modelo_sututeh.pkl, scaler_sututeh.pkl, encoders_sututeh.pkl
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={() => cargarDatosML(true)}
            sx={{ mt: 2 }}
          >
            🔄 Verificar ML
          </Button>
        </Paper>
      </Container>
    );
  }

  // ✅ SUCCESS STATE - MOSTRAR DATOS ML
  // 🎯 AJUSTAR FILTROS: Riesgo solo para <50% (más oportunidades)
  const highProbUsers = mlData.usuarios.filter(u => u.probabilidad_asistencia >= 0.50); // ≥50% = Sí Asistirán
  const lowProbUsers = mlData.usuarios.filter(u => u.probabilidad_asistencia < 0.50);    // <50% = No Asistirán

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
          onClick={() => cargarDatosML(true)}
          variant="contained"
          color="primary"
        >
          🔄 Actualizar ML
        </Button>
      </Box>

      {/* Header Status - LIMPIO */}
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
          Sistema ML
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {mlData.total_usuarios} usuarios procesados
        </Typography>
      </Box>

      {/* Stats Overview - MODIFICADAS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Sí Asistirán"
            value={highProbUsers.length}
            subtitle="Alta Probabilidad"
            badge="PRED"
            color="#4299e1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={WarningIcon}
            title="No Asistirán"
            value={lowProbUsers.length}
            subtitle="Baja Probabilidad"
            badge="RISK"
            color="#d69e2e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={GroupIcon}
            title="Total Usuarios"
            value={mlData.estadisticas_simples.total_usuarios}
            subtitle="Analizados"
            badge="TOTAL"
            color="#38a169"
          />
        </Grid>
      </Grid>

      {/* Clustering */}
      <Paper sx={{ mb: 3, p: 2, elevation: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Segmentación
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {Object.entries(mlData.clusters).map(([name, count]) => (
            <Grid item xs={12} sm={6} md={3} key={name}>
              <ClusterCard name={name} count={count} />
            </Grid>
          ))}
        </Grid>

        {getChartData() && (
          <Box sx={{ height: 300, position: 'relative', mt: 2 }}>
            <Doughnut data={getChartData()} options={chartOptions} />
          </Box>
        )}
      </Paper>

      {/* Análisis de Usuarios - MOSTRAR TODOS LOS USUARIOS */}
      <Paper sx={{ p: 2, elevation: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Análisis Individual
        </Typography>

        <Grid container spacing={2}>
          {/* Alta Probabilidad - TODOS LOS USUARIOS */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                  pb: 0.5,
                  borderBottom: '2px solid #38a169',
                  color: '#38a169',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                Sí Asistirán ({highProbUsers.length})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {highProbUsers.length > 0 ? (
                  // ORDENAR DE MAYOR A MENOR PORCENTAJE
                  highProbUsers
                    .sort((a, b) => b.probabilidad_asistencia - a.probabilidad_asistencia)
                    .map((user) => (
                      <UserItem key={user.usuario_id} user={user} />
                    ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    No hay usuarios con alta probabilidad
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Riesgo Detectado - TODOS LOS USUARIOS */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                  pb: 0.5,
                  borderBottom: '2px solid #e53e3e',
                  color: '#e53e3e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <ErrorIcon sx={{ fontSize: 16 }} />
                No Asistirán ({lowProbUsers.length})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {lowProbUsers.length > 0 ? (
                  // MOSTRAR TODOS los usuarios con baja probabilidad  
                  lowProbUsers.map((user) => (
                    <UserItem key={user.usuario_id} user={user} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    Todos los usuarios tienen alta probabilidad ML
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Info del Sistema - SIMPLIFICADO */}
      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          Sistema activo con archivos cargados correctamente
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