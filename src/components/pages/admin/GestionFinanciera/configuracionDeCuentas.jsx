import React, { useState, useEffect } from 'react';
import {
  Container, Box, Button, Paper, TextField, IconButton,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, Grid, Typography, Chip, Switch,
  Card, CardContent, CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutlined as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

function ConfigCuentas() {
  const [cuentas, setCuentas] = useState([
    {
      id: 1,
      numeroCuenta: '1234567890123456',
      banco: 'BBVA',
      titular: 'Empresa XYZ S.A. de C.V.',
      tipo: 'Corriente',
      activo: true,
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      numeroCuenta: '9876543210987654',
      banco: 'Santander',
      titular: 'Empresa XYZ S.A. de C.V.',
      tipo: 'Ahorro',
      activo: false,
      fechaCreacion: '2024-02-10'
    }
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [form, setForm] = useState({
    numeroCuenta: '',
    banco: '',
    titular: '',
    tipo: 'Corriente',
    activo: true
  });

  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const bancos = [
    'BBVA', 'Santander', 'Banamex', 'Banorte', 'HSBC', 
    'Scotiabank', 'Inbursa', 'Azteca', 'Compartamos', 'Otro'
  ];

  const tiposCuenta = ['Corriente', 'Ahorro', 'Nómina', 'Inversión'];

  const showSnackbar = (msg, sev = 'success') => 
    setSnackbar({ open: true, message: msg, severity: sev });

  const openForm = (cuenta = null) => {
    if (cuenta) {
      setEditing(cuenta);
      setForm({
        numeroCuenta: cuenta.numeroCuenta,
        banco: cuenta.banco,
        titular: cuenta.titular,
        tipo: cuenta.tipo,
        activo: cuenta.activo
      });
    } else {
      setEditing(null);
      setForm({
        numeroCuenta: '',
        banco: '',
        titular: '',
        tipo: 'Corriente',
        activo: true
      });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm({
      numeroCuenta: '',
      banco: '',
      titular: '',
      tipo: 'Corriente',
      activo: true
    });
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.numeroCuenta || !form.banco || !form.titular) {
      showSnackbar('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (editing) {
      // Actualizar cuenta existente
      setCuentas(prev => prev.map(cuenta => 
        cuenta.id === editing.id 
          ? { ...cuenta, ...form }
          : cuenta
      ));
      showSnackbar('Cuenta bancaria actualizada correctamente');
    } else {
      // Crear nueva cuenta
      const nuevaCuenta = {
        id: Date.now(),
        ...form,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setCuentas(prev => [...prev, nuevaCuenta]);
      showSnackbar('Cuenta bancaria agregada correctamente');
    }
    
    closeForm();
  };

  const handleDeleteClick = (cuenta) => {
    setToDelete(cuenta);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setCuentas(prev => prev.filter(cuenta => cuenta.id !== toDelete.id));
    showSnackbar('Cuenta bancaria eliminada correctamente');
    setConfirmOpen(false);
    setToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  const toggleEstado = (id) => {
    setCuentas(prev => prev.map(cuenta => 
      cuenta.id === id 
        ? { ...cuenta, activo: !cuenta.activo }
        : cuenta
    ));
    showSnackbar('Estado de cuenta actualizado');
  };

  const formatNumeroCuenta = (numero) => {
    return numero.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <AccountBalanceIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Configuración de Cuentas Bancarias
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Administra las cuentas bancarias de la organización
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Botón Agregar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => openForm()}
          size="large"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem'
          }}
        >
          Agregar Cuenta Bancaria
        </Button>
      </Box>

      {/* Tabla de Cuentas */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Número de Cuenta
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Banco
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Titular
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Tipo
                </TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Estado
                </TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cuentas.map((cuenta) => (
                <TableRow 
                  key={cuenta.id} 
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                      {formatNumeroCuenta(cuenta.numeroCuenta)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {cuenta.banco}
                    </Box>
                  </TableCell>
                  <TableCell>{cuenta.titular}</TableCell>
                  <TableCell>
                    <Chip 
                      label={cuenta.tipo}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cuenta.activo ? 'Activo' : 'Inactivo'}
                      color={cuenta.activo ? 'success' : 'error'}
                      size="small"
                      onClick={() => toggleEstado(cuenta.id)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => openForm(cuenta)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteClick(cuenta)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {cuentas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                      No hay cuentas bancarias registradas
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Agrega tu primera cuenta bancaria usando el botón superior
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Agregar/Editar */}
      <Dialog 
        open={formOpen} 
        onClose={closeForm} 
        fullWidth 
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div">
            {editing ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Cuenta"
                  name="numeroCuenta"
                  fullWidth
                  required
                  value={form.numeroCuenta}
                  onChange={handleChange}
                  placeholder="1234567890123456"
                  helperText="Ingresa el número completo de la cuenta"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Banco</InputLabel>
                  <Select
                    label="Banco"
                    name="banco"
                    value={form.banco}
                    onChange={handleChange}
                  >
                    {bancos.map((banco) => (
                      <MenuItem key={banco} value={banco}>
                        {banco}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Titular de la Cuenta"
                  name="titular"
                  fullWidth
                  required
                  value={form.titular}
                  onChange={handleChange}
                  placeholder="Nombre completo del titular"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cuenta</InputLabel>
                  <Select
                    label="Tipo de Cuenta"
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                  >
                    {tiposCuenta.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography component="label" sx={{ mr: 2 }}>
                    Estado:
                  </Typography>
                  <Switch
                    name="activo"
                    checked={form.activo}
                    onChange={handleChange}
                    color="success"
                  />
                  <Typography sx={{ ml: 1 }}>
                    {form.activo ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeForm}
            startIcon={<CancelIcon />}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la cuenta bancaria 
            <strong> {toDelete?.numeroCuenta}</strong> del banco 
            <strong> {toDelete?.banco}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete} variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ minWidth: '300px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ConfigCuentas;