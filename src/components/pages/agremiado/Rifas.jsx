import React, { useState } from 'react';
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
  LinearProgress
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

// Helper functions for TransferList
function not(a, b) {
  return a.filter((value) => !b.includes(value));
}
function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

// Productos con mejor estructura
const products = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max', 
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=400&h=400&q=80', 
    description: 'Smartphone de última generación con cámara profesional y pantalla Dynamic Island.',
    value: '$28,999'
  },
  { 
    id: 2, 
    name: 'PlayStation 5', 
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&h=400&q=80', 
    description: 'Consola de videojuegos con gráficos 4K y experiencia inmersiva.',
    value: '$13,999'
  },
  { 
    id: 3, 
    name: 'AirPods Pro', 
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&h=400&q=80', 
    description: 'Auriculares inalámbricos con cancelación activa de ruido.',
    value: '$5,999'
  }
];

// Datos de estadísticas de la rifa
const rifaStats = {
  totalBoletos: 100,
  vendidos: 37,
  participantes: 24
};

export default function Rifas() {
  // Estados
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([1, 5, 12, 18, 25, 34, 44, 50, 56, 62, 69, 77, 83, 91, 99]);
  const [right, setRight] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  // Handlers
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

  // Lista personalizada mejorada
  const customList = (title, items, isSelected = false) => (
    <Card 
      elevation={3}
      sx={{
        background: isSelected 
          ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)'
          : 'white',
        border: isSelected ? '2px solid #4caf50' : '1px solid #e0e0e0',
        borderRadius: 3
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography 
            variant="h6" 
            fontWeight="600"
            color={isSelected ? "success.main" : "text.primary"}
          >
            {title}
          </Typography>
          <Chip 
            label={items.length} 
            size="medium" 
            color={isSelected ? "success" : "default"}
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
                    bgcolor: 'success.light',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'success.main',
                    }
                  }
                }}
              >
                <Checkbox 
                  size="small" 
                  checked={checked.includes(value)} 
                  disableRipple 
                  color="success"
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
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
          mt: 2,
          borderRadius: 2
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
                label="¡PRÓXIMAMENTE!"
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
                image="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Rifa Banner"
              />
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="600" color="primary">
                Rifa Especial 2025
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                No te pierdas esta oportunidad única de ganar increíbles premios
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
                        30 Abril 2025
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      <AccessTime fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Hora
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        18:00 hrs
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                      <AttachMoney fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Precio por Boleto
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        $50 MXN
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main' }}>
                      <LocationOn fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Lugar
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        Auditorio UTH
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
                  value={(rifaStats.vendidos / rifaStats.totalBoletos) * 100} 
                  sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption">
                    {rifaStats.vendidos}/{rifaStats.totalBoletos} boletos vendidos
                  </Typography>
                  <Typography variant="caption">
                    {rifaStats.participantes} participantes
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>

          {/* Premios */}
          <Typography 
            variant="h6" 
            gutterBottom 
            fontWeight="600"
            color="success.main"
            sx={{ mb: 2 }}
          >
            Premios Increíbles
          </Typography>
          
          <Grid container spacing={1.5}>
            {products.map((prod, index) => (
              <Grid item xs={12} key={prod.id}>
                <Zoom in timeout={300 * (index + 1)}>
                  <Card 
                    onClick={() => openDialog(prod)} 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                      }
                    }}
                    elevation={2}
                  >
                    <Box display="flex" alignItems="center" p={1.5}>
                      <Badge
                        badgeContent={`${index + 1}°`}
                        color="success"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }
                        }}
                      >
                        <Avatar
                          src={prod.image}
                          sx={{ width: 56, height: 56, mr: 1.5 }}
                        />
                      </Badge>
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="600" gutterBottom>
                          {prod.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {prod.description}
                        </Typography>
                        <Chip 
                          label={`${prod.value} MXN`} 
                          size="small" 
                          color="primary" 
                          sx={{ fontWeight: '500' }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            ))}
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
                    ${right.length * 50}
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

      {/* Dialog de productos */}
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
              {currentProduct?.name}
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
                height="200" 
                image={currentProduct.image} 
                alt={currentProduct.name}
                sx={{ mb: 2, borderRadius: 2 }}
              />
              <Typography variant="body1" paragraph color="text.secondary">
                {currentProduct.description}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="600">
                  Valor estimado:
                </Typography>
                <Chip 
                  label={`${currentProduct.value} MXN`} 
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