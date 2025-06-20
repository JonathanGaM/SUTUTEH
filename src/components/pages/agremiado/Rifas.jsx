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
  DialogActions,
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
  Badge
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
  LocalActivity
} from '@mui/icons-material';

// Helper functions for TransferList
function not(a, b) {
  return a.filter((value) => !b.includes(value));
}
function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}
function union(a, b) {
  return [...a, ...not(b, a)];
}

// Productos con mejor estructura
const products = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max', 
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=400&h=400&q=80', 
    description: 'Smartphone de última generación con cámara profesional y pantalla Dynamic Island.',
    value: '$28,999 MXN'
  },
  { 
    id: 2, 
    name: 'PlayStation 5', 
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&h=400&q=80', 
    description: 'Consola de videojuegos con gráficos 4K y experiencia inmersiva.',
    value: '$13,999 MXN'
  },
  { 
    id: 3, 
    name: 'AirPods Pro', 
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&h=400&q=80', 
    description: 'Auriculares inalámbricos con cancelación activa de ruido.',
    value: '$5,999 MXN'
  }
];

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

  // Lista personalizada
  const customList = (title, items, isSelected = false) => (
    <Card elevation={isSelected ? 6 : 2}>
      <CardContent sx={{ p: 1.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body1" color={isSelected ? "success.main" : "text.primary"}>
            {title}
          </Typography>
          <Chip 
            label={items.length} 
            size="small" 
            color={isSelected ? "success" : "default"}
          />
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Paper
          variant="outlined"
          sx={{ 
            height: 200, 
            overflow: 'auto',
            p: 0.5
          }}
        >
          <List dense>
            {items.map((value) => (
              <ListItemButton 
                key={value} 
                onClick={handleToggle(value)}
                selected={checked.includes(value)}
                sx={{ mb: 0.25, py: 0.5 }}
              >
                <Checkbox 
                  size="small" 
                  checked={checked.includes(value)} 
                  disableRipple 
                  color="success"
                  sx={{ p: 0.25 }}
                />
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ConfirmationNumber fontSize="small" color="action" />
                      <Typography variant="body2">
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
    <Container maxWidth="xl" sx={{ mt: 12, mb: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Rifas Sututeh
              </Typography>
              <Box sx={{ height: 2, width: 120, bgcolor: 'green', mx: 'auto', mt: 1, mb: 2 }} />
            </Box>

      <Grid container spacing={3}>
        {/* Información de la rifa - Lado izquierdo */}
        <Grid item xs={12} md={5}>
          {/* Card principal de la rifa */}
          <Card elevation={4} sx={{ mb: 2 }}>
            {/* Badge flotante */}
            <Box position="relative">
              <Chip
                icon={<EmojiEvents fontSize="small" />}
                label="¡PRÓXIMAMENTE!"
                color="warning"
                size="small"
                sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1 }}
              />
              
              <CardMedia 
                component="img" 
                height="180" 
                image="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Rifa Banner"
              />
            </Box>
            
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 28, height: 28 }} color="primary">
                      <CalendarToday fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha</Typography>
                      <Typography variant="body2">30 Abril 2025</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 28, height: 28 }} color="primary">
                      <AccessTime fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Hora</Typography>
                      <Typography variant="body2">18:00 hrs</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 28, height: 28 }} color="primary">
                      <AttachMoney fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Precio</Typography>
                      <Typography variant="body2">$50 MXN</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 28, height: 28 }} color="primary">
                      <LocationOn fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Lugar</Typography>
                      <Typography variant="body2">Auditorio UTH</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Premios */}
          <Typography variant="h6" gutterBottom color="success.main">
            🎁 Premios Increíbles
          </Typography>
          
          <Grid container spacing={1}>
            {products.map((prod, index) => (
              <Grid item xs={12} key={prod.id}>
                <Zoom in timeout={300 * (index + 1)}>
                  <Card onClick={() => openDialog(prod)} sx={{ cursor: 'pointer' }}>
                    <Box display="flex" alignItems="center" p={1.5}>
                      <Badge
                        badgeContent={`${index + 1}°`}
                        color="success"
                      >
                        <Avatar
                          src={prod.image}
                          sx={{ width: 60, height: 60, mr: 1.5 }}
                        />
                      </Badge>
                      <Box flex={1}>
                        <Typography variant="body1">{prod.name}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {prod.description}
                        </Typography>
                        <Chip 
                          label={prod.value} 
                          size="small" 
                          color="primary" 
                          sx={{ mt: 0.5 }}
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
          <Box mb={2}>
            <Typography variant="h6" gutterBottom color="success.main">
              Selecciona tus Números
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Elige tus números de la suerte y participa en la rifa
            </Typography>
          </Box>

          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={5}>
              {customList('Números Disponibles', left, false)}
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Stack spacing={0.5} alignItems="center">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAllRight}
                  disabled={left.length === 0}
                  color="success"
                  sx={{ minWidth: 40, fontSize: '0.75rem' }}
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
                  sx={{ fontSize: '0.75rem' }}
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
                  sx={{ fontSize: '0.75rem' }}
                >
                  Quitar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAllLeft}
                  disabled={right.length === 0}
                  color="warning"
                  sx={{ minWidth: 40, fontSize: '0.75rem' }}
                >
                  ≪
                </Button>
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              {customList('Mis Boletos', right, true)}
            </Grid>
          </Grid>

          {/* Resumen y botón de compra */}
          <Fade in={right.length > 0}>
            <Paper
              elevation={4}
              sx={{ mt: 3, p: 2, textAlign: 'center' }}
            >
              <Typography variant="body1" gutterBottom>
                Resumen de tu Compra
              </Typography>
              <Box display="flex" justifyContent="space-around" mb={2}>
                <Box>
                  <Typography variant="h5">{right.length}</Typography>
                  <Typography variant="body2">Boletos</Typography>
                </Box>
                <Box>
                  <Typography variant="h5">${right.length * 50}</Typography>
                  <Typography variant="body2">Total MXN</Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                size="medium"
                fullWidth
                startIcon={<LocalActivity fontSize="small" />}
                color="success"
                sx={{ py: 1 }}
              >
                Confirmar Compra
              </Button>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Dialog de productos */}
      <Dialog 
        open={open} 
        onClose={closeDialog} 
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{currentProduct?.name}</Typography>
            <IconButton onClick={closeDialog} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {currentProduct && (
            <>
              <CardMedia 
                component="img" 
                height="200" 
                image={currentProduct.image} 
                alt={currentProduct.name}
                sx={{ mb: 1.5 }}
              />
              <Typography variant="body2" paragraph>
                {currentProduct.description}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body1" color="primary">
                  Valor estimado:
                </Typography>
                <Chip 
                  label={currentProduct.value} 
                  color="success" 
                  size="small"
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}