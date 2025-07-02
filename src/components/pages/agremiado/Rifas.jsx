import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Divider,
  Stack,
  Box,
  Chip,
  Avatar,
  Paper,
  Zoom,
  Fade,
  IconButton,
  Badge,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  AttachMoney,
  ConfirmationNumber,
  EmojiEvents,
  Close,
  ArrowForward,
  ArrowBack,
  LocalActivity,
  Person
} from '@mui/icons-material';
import { API_URL } from '../../../config/apiConfig';

// Helper functions for TransferList
function not(a, b) {
  return a.filter((value) => !b.includes(value));
}
function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

// Función para formatear fecha a "26 de junio de 2025"
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
};

// Función para formatear hora a "04:00 hr"
const formatTimeForDisplay = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes} hr`;
};

export default function Rifas() {
  // Estados existentes
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Estados para API
  const [rifas, setRifas] = useState([]);
  const [rifaSeleccionada, setRifaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  // Cargar rifas al montar el componente
  useEffect(() => {
    fetchRifas();
  }, []);

  // Función para obtener rifas desde la API
  const fetchRifas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/rifas`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        setRifas(result.data);
        // Seleccionar la primera rifa activa o la primera disponible
        const rifaActiva = result.data.find(rifa => {
          const ahora = new Date();
          const fechaCierre = new Date(rifa.fecha_cierre);
          return fechaCierre > ahora && rifa.boletos_disponibles > 0;
        }) || result.data[0];
        
        setRifaSeleccionada(rifaActiva);
        generateBoletosDisponibles(rifaActiva);
      }
    } catch (error) {
      console.error('Error al cargar rifas:', error);
      setError('Error al cargar las rifas');
    } finally {
      setLoading(false);
    }
  };

  // Generar números de boletos disponibles
  const generateBoletosDisponibles = (rifa) => {
    if (!rifa) return;
    
    const totalBoletos = rifa.boletos_disponibles;
    const boletosDisponibles = [];
    
    // Generar números del 1 al total de boletos
    for (let i = 1; i <= totalBoletos; i++) {
      boletosDisponibles.push(i);
    }
    
    setLeft(boletosDisponibles);
    setRight([]);
    setChecked([]);
  };

  // Handlers existentes
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);
    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const openDialog = (product) => {
    setCurrentProduct(product);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setTimeout(() => setCurrentProduct(null), 200);
  };

  // Función para manejar la compra (placeholder)
  const handleCompra = () => {
    if (right.length === 0) return;
    
    // Aquí se integrará MercadoPago
    console.log('Comprando boletos:', right);
    console.log('Total:', right.length * rifaSeleccionada.precio);
    
    // Por ahora mostrar alert
    alert(`¡Próximamente! Comprando ${right.length} boletos por $${right.length * rifaSeleccionada.precio}`);
  };

  // Lista personalizada mejorada - CAMBIO: Color gris en lugar de verde
  const customList = (title, items, isSelected = false) => (
    <Card 
      elevation={3}
      sx={{
        background: isSelected 
          ? 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)'  // CAMBIO: Gris claro
          : 'white',
        border: isSelected ? '2px solid #9e9e9e' : '1px solid #e0e0e0',  // CAMBIO: Borde gris
        borderRadius: 3
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography 
            variant="h6" 
            fontWeight="600"
            color={isSelected ? "text.primary" : "text.primary"}  // CAMBIO: Color normal
          >
            {title}
          </Typography>
          <Chip 
            label={items.length} 
            size="medium" 
            color={isSelected ? "default" : "default"}  // CAMBIO: Chip gris
            sx={{ 
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Paper
          variant="outlined"
          sx={{ 
            height: 280, 
            overflow: 'auto',
            p: 1,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <List dense>
            {items.map((value) => (
              <ListItemButton 
                key={value} 
                onClick={handleToggle(value)}
                selected={checked.includes(value)}
                sx={{ 
                  mb: 0.5, 
                  py: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'grey.300',  // CAMBIO: Gris claro para seleccionado
                    color: 'text.primary',  // CAMBIO: Texto normal
                    '&:hover': {
                      bgcolor: 'grey.400',  // CAMBIO: Gris más oscuro en hover
                    }
                  }
                }}
              >
                <Checkbox 
                  size="small" 
                  checked={checked.includes(value)} 
                  disableRipple 
                  color="default"  // CAMBIO: Checkbox gris
                  sx={{ mr: 1 }}
                />
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <ConfirmationNumber fontSize="small" />
                      <Typography variant="body2" fontWeight="500">
                        Boleto #{value.toString().padStart(3, '0')}
                      </Typography>
                    </Box>
                  } 
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </CardContent>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando rifas...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  // No hay rifas disponibles
  if (!rifaSeleccionada) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          No hay rifas disponibles en este momento.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            color: 'text.primary',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          Rifas Sututeh
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          ¡Participa y gana increíbles premios!
        </Typography>
        <Box sx={{ 
          height: 4, 
          width: 120, 
          background: 'linear-gradient(45deg, #2196f3, #4caf50)',
          mx: 'auto', 
          mt: 1,
          mb:2
        }} />
      </Box>

      <Grid container spacing={3}>
        {/* Información de la rifa - Lado izquierdo */}
        <Grid item xs={12} md={5}>
          {/* Card principal de la rifa */}
          <Card 
            elevation={6} 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            {/* Badge flotante */}
            <Box position="relative">
              <Chip
                icon={<EmojiEvents fontSize="small" />}
                label="¡ACTIVA!"
                color="warning"
                size="medium"
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  zIndex: 1,
                  fontWeight: '600',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              />
              
              <CardMedia 
                component="img" 
                height="180" 
                image={rifaSeleccionada.foto_rifa || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&h=400&q=80"} 
                alt="Rifa Banner"
              />
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="600" color="primary">
                {rifaSeleccionada.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {rifaSeleccionada.descripcion}
              </Typography>
              
             <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <CalendarToday fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Fecha del Sorteo
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {formatDateForDisplay(rifaSeleccionada.fecha)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <AccessTime fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Hora
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {formatTimeForDisplay(rifaSeleccionada.hora)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <AttachMoney fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Precio por Boleto
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        ${rifaSeleccionada.precio} MXN
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <LocationOn fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Lugar
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {rifaSeleccionada.ubicacion}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              {/* Estadísticas de la rifa */}
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  Progreso de la Rifa
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((rifaSeleccionada.boletos_disponibles - left.length) / rifaSeleccionada.boletos_disponibles) * 100} 
                  sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption">
                    {rifaSeleccionada.boletos_disponibles - left.length}/{rifaSeleccionada.boletos_disponibles} boletos vendidos
                  </Typography>
                  <Typography variant="caption">
                    {left.length} disponibles
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>

          {/* Premios - CAMBIO: Imágenes verticales más grandes */}
          <Typography 
            variant="h6" 
            gutterBottom 
            fontWeight="600"
            color="success.main"
            sx={{ mb: 2 }}
          >
            Premios Increíbles
          </Typography>
          
          <Grid container spacing={2}>
            {rifaSeleccionada.productos && rifaSeleccionada.productos.map((prod, index) => (
              <Grid item xs={12} sm={6} key={prod.id}>
                <Zoom in timeout={300 * (index + 1)}>
                  <Card 
                    onClick={() => openDialog(prod)} 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                    elevation={3}
                  >
                    {/* Badge de posición */}
                    <Box position="relative">
                      <Chip
                        label={`${index + 1}° Premio`}
                        color="warning"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8, 
                          zIndex: 1,
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      />
                      
                      {/* Imagen vertical más grande */}
                      <CardMedia 
                        component="img" 
                        height="180"
                        image={prod.foto || "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&h=400&q=80"} 
                        alt={prod.titulo}
                        sx={{
                          objectFit: 'cover',
                          backgroundColor: 'grey.100'
                        }}
                      />
                    </Box>
                    
                    {/* Contenido de la tarjeta */}
                    <CardContent sx={{ p: 2 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="600" 
                        gutterBottom
                        sx={{ 
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          color: 'primary.main'
                        }}
                      >
                        {prod.titulo}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}
                      >
                        {prod.descripcion || "Increíble premio esperándote"}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Chip 
                          icon={<EmojiEvents fontSize="small" />}
                          label="Premio" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          sx={{ 
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }}
                        />
                        
                        <Typography 
                          variant="caption" 
                          color="primary.main"
                          sx={{ 
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Ver detalles →
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
            
            {/* Mostrar mensaje si no hay productos */}
            {(!rifaSeleccionada.productos || rifaSeleccionada.productos.length === 0) && (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '2px dashed #e0e0e0'
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Premios por definir
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Los premios de esta rifa se anunciarán próximamente
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Selección de números - Lado derecho */}
        <Grid item xs={12} md={7}>
          <Box mb={3}>
            <Typography 
              variant="h6" 
              gutterBottom 
              fontWeight="600"
              color="success.main"
            >
              Selecciona tus Números
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Elige tus números de la suerte y participa en la rifa
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={5}>
              {customList('Números Disponibles', left, false)}
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center' 
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAllRight}
                    disabled={left.length === 0}
                    color="success"
                    sx={{ 
                      minWidth: 45, 
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    ≫
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCheckedRight}
                    disabled={leftChecked.length === 0}
                    startIcon={<ArrowForward fontSize="small" />}
                    color="success"
                    sx={{ fontWeight: '500', fontSize: '0.75rem' }}
                  >
                    Agregar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCheckedLeft}
                    disabled={rightChecked.length === 0}
                    startIcon={<ArrowBack fontSize="small" />}
                    color="warning"
                    sx={{ fontWeight: '500', fontSize: '0.75rem' }}
                  >
                    Quitar
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAllLeft}
                    disabled={right.length === 0}
                    color="warning"
                    sx={{ 
                      minWidth: 45, 
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    ≪
                  </Button>
                </Stack>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              {customList('Mis Boletos', right, true)}
            </Grid>
          </Grid>

          {/* Resumen y botón de compra */}
          <Fade in={right.length > 0}>
            <Paper
              elevation={4}
              sx={{ 
                mt: 3, 
                p: 3, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                border: '1px solid #4caf50'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="600">
                Resumen de tu Compra
              </Typography>
              <Box display="flex" justifyContent="space-around" mb={3}>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="success.main">
                    {right.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Boletos Seleccionados
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="success.main">
                    ${right.length * rifaSeleccionada.precio}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total MXN
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<LocalActivity />}
                color="success"
                onClick={handleCompra}
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: 2
                }}
              >
                CONFIRMAR COMPRA
              </Button>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Dialog de productos - CAMBIO: Imagen más vertical en el modal */}
      <Dialog 
        open={open} 
        onClose={closeDialog} 
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="600">
              {currentProduct?.titulo}
            </Typography>
            <IconButton onClick={closeDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {currentProduct && (
            <>
              <CardMedia 
                component="img" 
                height="300"
                image={currentProduct.foto || "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&h=400&q=80"} 
                alt={currentProduct.titulo}
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  objectFit: 'cover'  /* CAMBIO: Asegurar que se vea bien vertical */
                }}
              />
              <Typography variant="body1" paragraph color="text.secondary">
                {currentProduct.descripcion}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="600">
                  Premio de la rifa
                </Typography>
                <Chip 
                  label="¡Puedes ganarlo!" 
                  color="success" 
                  size="large"
                  sx={{ fontWeight: '600', fontSize: '1rem' }}
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}