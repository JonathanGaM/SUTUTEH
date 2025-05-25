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
  Stack
} from '@mui/material';

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

// Ejemplo de productos con imágenes de internet
const products = [
  { id: 1, name: 'Teléfono móvil Motorola EPlus', image: 'https://images.unsplash.com/photo-1581291519195-ef11498d1cf2?auto=format&fit=crop&w=400&h=400&q=80', description: 'Descripción detallada del Teléfono móvil Motorola EPlus.' },
  { id: 2, name: 'Plastation X', image: 'https://images.unsplash.com/photo-1581291519195-ef11498d1cf2?auto=format&fit=crop&w=400&h=400&q=80', description: 'Descripción detallada de la Plastation X.' },
  { id: 3, name: 'Auriculares Inalámbricos', image: 'https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=400&h=400&q=80', description: 'Auriculares con cancelación de ruido de alta fidelidad.' }
];

export default function Rifas() {
  // TransferList state
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([34, 44, 50, 56, 62, 69]);
  const [right, setRight] = useState([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);
    setChecked(newChecked);
  };
  const numberOfChecked = (items) => intersection(checked, items).length;
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

  // Dialog state para productos
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const openDialog = (product) => {
    setCurrentProduct(product);
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
    setCurrentProduct(null);
  };

  // Render list card
  const customList = (title, items) => (
    <Card sx={{ boxShadow: 3, borderRadius: 2, fontSize: '0.85rem' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>{title}</Typography>
        <Divider sx={{ mb: 1 }} />
        <List sx={{ height: 180, overflow: 'auto' }} dense>
          {items.map((value) => (
            <ListItemButton key={value} onClick={handleToggle(value)}>
              <Checkbox size="small" checked={checked.includes(value)} disableRipple />
              <ListItemText primary={`Número ${value}`} sx={{ fontSize: '0.85rem' }} />
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 15, '& *': { fontSize: '0.9rem' } }}>
      <Grid container spacing={2}>
        {/* Izquierda: Detalles de la rifa */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 1, boxShadow: 3, borderRadius: 2 }}>
            <CardMedia component="img" height="160" image="https://images.unsplash.com/photo-1602524206274-8c0fabf5ecf1?auto=format&fit=crop&w=800&h=200&q=80" alt="Rifa Banner" />
            <CardContent sx={{ py: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Rifa Especial SUTUTEH</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Fecha: 30 de abril de 2025, 18:00 hrs<br />
                Ubicación: Auditorio Central<br />
                Precio: $50 MXN
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', mb: 1 }}>Productos Rifados</Typography>
          <Grid container spacing={1}>
            {products.map((prod) => (
              <Grid item xs={6} sm={4} md={4} key={prod.id}>
                <Card
                  onClick={() => openDialog(prod)}
                  sx={{ cursor: 'pointer', boxShadow: 2, borderRadius: 2, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    image={prod.image}
                    alt={prod.name}
                    sx={{
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  />
                  <CardContent sx={{ py: 0.5 }}>
                    <Typography variant="body2" align="center" sx={{ fontSize: '0.85rem' }}>{prod.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Diálogo de detalle */}
          <Dialog open={open} onClose={closeDialog} fullWidth>
            <DialogTitle sx={{ fontSize: '1rem' }}>{currentProduct?.name}</DialogTitle>
            <DialogContent>
              {currentProduct?.image && (
                <CardMedia component="img" height="160" image={currentProduct.image} alt={currentProduct.name} sx={{ mb: 1 }} />
              )}
              <Typography sx={{ fontSize: '0.85rem' }}>{currentProduct?.description}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} color="secondary" size="small" sx={{ fontSize: '0.85rem' }}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Grid>

        {/* Derecha: Selección de números en doble columna */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item>{customList('Números disponibles', left)}</Grid>
            <Grid item>
              <Stack direction="column" spacing={1}>
                <Button variant="outlined" size="small" onClick={handleCheckedRight} disabled={!leftChecked.length}> &gt; </Button>
                <Button variant="outlined" size="small" onClick={handleCheckedLeft} disabled={!rightChecked.length}> &lt; </Button>
              </Stack>
            </Grid>
            <Grid item>{customList('Mis boletos', right)}</Grid>
          </Grid>

          {/* Botón Participar solo si hay boletos */}
          {right.length > 0 && (
            <Button
              variant="contained"
              sx={{
                mt: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '0.9rem',
                bgcolor: 'orange',
                width: 250,
                mx: 'auto',
                display: 'block',
                '&:hover': { bgcolor: 'darkorange', transform: 'scale(1.05)' },
                transition: 'transform 0.2s'
              }}
            >
              Participar / Comprar
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
