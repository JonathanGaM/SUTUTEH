// src/pages/admin/AdminRifas.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Button,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Slide
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';

// URL base de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Transition for Dialog
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function AdminRifas() {
  // State
  const [rifas, setRifas] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBoletos, setFilterBoletos] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openForm, setOpenForm] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [formData, setFormData] = useState({
    fotoRifa: null,
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    precio: '',
    ubicacion: '',
    boletosDisponibles: '',
    fechaPublicacion: '',
    fechaCierre: '',
    productos: []
  });
  const fileInput = useRef();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado para vista
  const [openView, setOpenView] = useState(false);
  const [currentView, setCurrentView] = useState(null);

  // Cargar rifas al montar
  useEffect(() => {
    fetchRifas();
  }, []);

  // Obtener rifas
  const fetchRifas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rifas`);
      const result = await response.json();
      
      if (result.success) {
        const rifasFormateadas = result.data.map(rifa => ({
          id: rifa.id,
          titulo: rifa.titulo,
          descripcion: rifa.descripcion,
          fecha: rifa.fecha,
          hora: rifa.hora,
          precio: rifa.precio,
          ubicacion: rifa.ubicacion,
          boletosDisponibles: rifa.boletos_disponibles,
          fechaPublicacion: rifa.fecha_publicacion,
          fechaCierre: rifa.fecha_cierre,
          fotoRifa: rifa.foto_rifa,
          productos: rifa.productos || []
        }));
        setRifas(rifasFormateadas);
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Error al cargar rifas', severity: 'error' });
    }
  };

  // Handlers for search and pagination
  const handleSearch = e => setSearch(e.target.value);
  const handleFilterBoletos = e => setFilterBoletos(e.target.value);
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };

  // Funciones para vista
  const openViewDialog = (rifa) => {
    setCurrentView(rifa);
    setOpenView(true);
  };

  const closeView = () => {
    setOpenView(false);
    setCurrentView(null);
  };

  // Filtered data
  const filtered = useMemo(() => {
    return rifas
      .filter(r =>
        r.titulo.toLowerCase().includes(search.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(search.toLowerCase())
      )
      .filter(r => {
        if (filterBoletos === 'Disponibles') return Number(r.boletosDisponibles) > 0;
        if (filterBoletos === 'Agotadas') return Number(r.boletosDisponibles) === 0;
        return true;
      });
  }, [rifas, search, filterBoletos]);

  // Open/close form dialog
  const openFormDialog = rifa => {
    if (rifa) {
      setCurrentEdit(rifa.id);
      setFormData({
        fotoRifa: rifa.fotoRifa,
        titulo: rifa.titulo,
        descripcion: rifa.descripcion,
        fecha: rifa.fecha,
        hora: rifa.hora,
        precio: rifa.precio,
        ubicacion: rifa.ubicacion,
        boletosDisponibles: rifa.boletosDisponibles,
        fechaPublicacion: rifa.fechaPublicacion,
        fechaCierre: rifa.fechaCierre,
        productos: rifa.productos || []
      });
    } else {
      setCurrentEdit(null);
      setFormData({ fotoRifa: null, titulo: '', descripcion: '', fecha: '', hora: '', precio: '', ubicacion: '', boletosDisponibles: '', fechaPublicacion: '', fechaCierre: '', productos: [] });
    }
    setOpenForm(true);
  };
  const closeForm = () => setOpenForm(false);

  // Form field handlers
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = e => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, fotoRifa: e.target.files[0] }));
    }
  };

  // Product handlers
  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, { id: Date.now(), foto: null, titulo: '', descripcion: '' }]
    }));
  };
  const updateProduct = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };
  const removeProduct = id => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== id)
    }));
  };

  const handleProductFileChange = (e, productId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Crear preview inmediato
    const fileUrl = URL.createObjectURL(file);
    updateProduct(productId, 'foto', fileUrl);
    updateProduct(productId, 'fotoFile', file); // Guardar el archivo para enviar luego
  };

  // Save or update raffle
  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('hora', formData.hora);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('ubicacion', formData.ubicacion);
      formDataToSend.append('boletos_disponibles', formData.boletosDisponibles);
      formDataToSend.append('fecha_publicacion', formData.fechaPublicacion || '');
      formDataToSend.append('fecha_cierre', formData.fechaCierre || '');
      
      if (formData.fotoRifa && typeof formData.fotoRifa !== 'string') {
        formDataToSend.append('foto_rifa', formData.fotoRifa);
      }
      
      // Subir fotos de productos primero si hay archivos nuevos
      const productosConFotos = await Promise.all(
        formData.productos.map(async (producto) => {
          if (producto.fotoFile) {
            try {
              const formDataFile = new FormData();
              formDataFile.append('foto_producto', producto.fotoFile);

              const response = await fetch(`${API_BASE_URL}/rifas/producto/foto`, {
                method: 'POST',
                body: formDataFile
              });

              const result = await response.json();

              if (result.success) {
                return {
                  titulo: producto.titulo,
                  descripcion: producto.descripcion || '',
                  foto: result.data.url
                };
              }
            } catch (error) {
              console.error('Error al subir foto de producto:', error);
            }
          }
          return {
            titulo: producto.titulo,
            descripcion: producto.descripcion || '',
            foto: producto.foto && !producto.foto.startsWith('blob:') ? producto.foto : null
          };
        })
      );
      
      // Convertir productos a string para que el backend lo pueda parsear
      const productosString = JSON.stringify(productosConFotos);
      formDataToSend.append('productos', productosString);

      const url = currentEdit != null 
        ? `${API_BASE_URL}/rifas/${currentEdit}`
        : `${API_BASE_URL}/rifas`;
      
      const method = currentEdit != null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      console.log('Status de respuesta:', response.status);
      
      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        console.log('Respuesta como texto:', textResult);
        result = { success: false, message: 'Error del servidor' };
      }
      
      console.log('Respuesta del servidor:', result);

      if (result.success) {
        setSnackbar({
          open: true, 
          message: currentEdit != null ? 'Rifa actualizada' : 'Rifa creada', 
          severity: 'success'
        });
        closeForm();
        fetchRifas();
      } else {
        setSnackbar({ open: true, message: result.message || 'Error al guardar', severity: 'error' });
      }
    } catch (error) {
      console.error('Error completo:', error);
      setSnackbar({ open: true, message: 'Error de conexión', severity: 'error' });
    }
  };

  // Delete raffle
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta rifa?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/rifas/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({ open: true, message: 'Rifa eliminada', severity: 'success' });
        fetchRifas();
      } else {
        setSnackbar({ open: true, message: result.message || 'Error al eliminar', severity: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Error de conexión', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Action Bar */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
          transition: "box-shadow 0.3s",
          "&:hover": { boxShadow: 10 },
        }}
      >
        <TextField
          label="Buscar rifa"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Boletos</InputLabel>
          <Select
            value={filterBoletos}
            label="Boletos"
            onChange={handleFilterBoletos}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Disponibles">Disponibles</MenuItem>
            <MenuItem value="Agotadas">Agotadas</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openFormDialog(null)}
          size="small"
        >
          Nueva Rifa
        </Button>
      </Paper>

      {/* Raffles Table */}
      <Paper
        elevation={2}
        sx={{
          mb: 1.5,
          transition: "box-shadow 0.3s",
          "&:hover": { boxShadow: 10 },
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgb(2 135 209)" }}>
                <TableCell sx={{ color: "#fff" }}>Título</TableCell>
                <TableCell sx={{ color: "#fff" }}>Fecha</TableCell>
                <TableCell sx={{ color: "#fff" }}>Hora</TableCell>
                <TableCell sx={{ color: "#fff" }}>Precio</TableCell>
                <TableCell sx={{ color: "#fff" }}># Boletos</TableCell>
                <TableCell align="center" sx={{ color: "#fff" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.titulo}</TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>${row.precio}</TableCell>
                    <TableCell>{row.boletosDisponibles}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openFormDialog(row)}
                        sx={{ color: "blue" }}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDelete(row.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(row)}
                        sx={{ color: "green" }}
                      >
                        <VisibilityIcon />
                      </IconButton>

                      <IconButton
                        color="secondary"
                        sx={{ p: 0.5 }}
                        onClick={() => {
                          console.log("Mostrar estadísticas para", row.id);
                        }}
                      >
                        <AssessmentIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRows}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Form Dialog */}
      <Dialog
        open={openForm}
        onClose={closeForm}
        fullWidth
        maxWidth="md"
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>
          {currentEdit != null ? "Editar Rifa" : "Crear Rifa"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button component="label" startIcon={<PhotoCamera />} fullWidth>
                Foto de Rifa
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  name="fotoRifa"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>

              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  mt: 1,
                  borderRadius: 1,
                  border: "1px solid rgba(0,0,0,0.23)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#fafafa",
                }}
              >
                {formData.fotoRifa ? (
                  <Box
                    component="img"
                    src={typeof formData.fotoRifa === 'string' ? formData.fotoRifa : URL.createObjectURL(formData.fotoRifa)}
                    alt="Foto de Rifa"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No hay imagen
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Título"
                name="titulo"
                fullWidth
                size="small"
                value={formData.titulo}
                onChange={handleFormChange}
              />
              <TextField
                label="Descripción"
                name="descripcion"
                fullWidth
                size="small"
                multiline
                rows={8}
                sx={{ mt: 1 }}
                value={formData.descripcion}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Hora"
                type="time"
                name="hora"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.hora}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Precio"
                name="precio"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                value={formData.precio}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="# Boletos Disponibles"
                name="boletosDisponibles"
                type="number"
                fullWidth
                size="small"
                value={formData.boletosDisponibles}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Ubicación"
                name="ubicacion"
                fullWidth
                size="small"
                value={formData.ubicacion}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Fecha de Publicación"
                type="date"
                name="fechaPublicacion"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.fechaPublicacion}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Fecha de Cierre"
                type="date"
                name="fechaCierre"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.fechaCierre}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Productos a Rifar</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addProduct}>
                Agregar Producto
              </Button>
            </Grid>

            {[...formData.productos].reverse().map((prod) => (
              <Grid
                container
                spacing={1}
                key={prod.id}
                sx={{
                  border: "1px solid #ccc",
                  p: 1,
                  m: 1,
                  borderRadius: 1,
                  position: "relative",
                }}
              >
                <IconButton
                  size="small"
                  color="error"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    zIndex: 10,
                    backgroundColor: "background.paper",
                  }}
                  onClick={() => removeProduct(prod.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <Grid item xs={12} sm={3}>
                  <Button
                    component="label"
                    startIcon={<PhotoCamera />}
                    fullWidth
                  >
                    Foto
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleProductFileChange(e, prod.id)}
                    />
                  </Button>
                  <Box
                    sx={{
                      width: "100%",
                      height: 150,
                      mt: 1,
                      borderRadius: 1,
                      border: "1px solid rgba(0,0,0,0.23)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fafafa",
                    }}
                  >
                    {prod.foto ? (
                      <Box
                        component="img"
                        src={prod.foto}
                        alt="Foto Producto"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin imagen
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Título Producto"
                    fullWidth
                    size="small"
                    value={prod.titulo}
                    onChange={(e) =>
                      updateProduct(prod.id, "titulo", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Descripción Producto"
                    fullWidth
                    size="small"
                    value={prod.descripcion}
                    onChange={(e) =>
                      updateProduct(prod.id, "descripcion", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeForm}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openView}
        onClose={closeView}
        fullWidth
        maxWidth="md"
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>Ver Rifa</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  mt: 1,
                  borderRadius: 1,
                  border: "1px solid rgba(0,0,0,0.23)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#fafafa",
                }}
              >
                {currentView?.fotoRifa ? (
                  <Box
                    component="img"
                    src={currentView.fotoRifa}
                    alt="Foto de Rifa"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Sin imagen
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Título"
                value={currentView?.titulo || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Descripción"
                value={currentView?.descripcion || ""}
                fullWidth
                size="small"
                multiline
                rows={8}
                sx={{ mt: 1 }}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha"
                value={currentView?.fecha || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Hora"
                value={currentView?.hora || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Precio"
                value={currentView ? `$${currentView.precio}` : ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="# Boletos Disponibles"
                value={currentView?.boletosDisponibles || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Ubicación"
                value={currentView?.ubicacion || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Fecha de Publicación"
                value={currentView?.fechaPublicacion || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Fecha de Cierre"
                value={currentView?.fechaCierre || ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Productos a Rifar</Typography>
            </Grid>

            {!currentView?.productos?.length && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  No hay productos
                </Typography>
              </Grid>
            )}

            {currentView?.productos?.map((prod) => (
              <Grid
                container
                spacing={1}
                key={prod.id}
                sx={{
                  border: "1px solid #ccc",
                  p: 1,
                  m: 1,
                  borderRadius: 1,
                }}
              >
                <Grid item xs={12} sm={3}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 150,
                      mt: 1,
                      borderRadius: 1,
                      border: "1px solid rgba(0,0,0,0.23)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fafafa",
                    }}
                  >
                    {prod.foto ? (
                      <Box
                        component="img"
                        src={prod.foto}
                        alt="Foto Producto"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin imagen
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Título Producto"
                    value={prod.titulo}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Descripción Producto"
                    value={prod.descripcion}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeView}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}