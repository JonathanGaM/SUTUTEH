// src/pages/admin/AdminRifas.jsx
import React, { useState, useMemo, useRef } from 'react';
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
    productos: []
  });
  const fileInput = useRef();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handlers for search and pagination
  const handleSearch = e => setSearch(e.target.value);
  const handleFilterBoletos = e => setFilterBoletos(e.target.value);
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };
  // 1) Estado para abrir/cerrar el Dialog de vista
  const [openView, setOpenView] = useState(false);

  // 2) Estado para guardar la rifa actual que quieres “ver”
  const [currentView, setCurrentView] = useState(null);

  // 3) Función que abre el Dialog de vista y le inyecta la rifa clickeada
  const openViewDialog = (rifa) => {
    setCurrentView(rifa);
    setOpenView(true);
  };

  // 4) Función que cierra el Dialog de vista
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
      setFormData(rifa);
    } else {
      setCurrentEdit(null);
      setFormData({ fotoRifa: null, titulo: '', descripcion: '', fecha: '', hora: '', precio: '', ubicacion: '', boletosDisponibles: '', productos: [] });
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
    const fileUrl = URL.createObjectURL(e.target.files[0]);
    setFormData(prev => ({ ...prev, fotoRifa: fileUrl }));
  };

  // Product handlers (optional)
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

  // Save or update raffle
  const handleSave = () => {
    let updated;
    if (currentEdit != null) {
      updated = rifas.map(r => r.id === currentEdit ? { ...formData, id: currentEdit } : r);
      setSnackbar({ open: true, message: 'Rifa actualizada', severity: 'success' });
    } else {
      updated = [{ ...formData, id: Date.now() }, ...rifas];
      setSnackbar({ open: true, message: 'Rifa creada', severity: 'success' });
    }
    setRifas(updated);
    closeForm();
  };

  // Delete raffle
  const handleDelete = id => {
    setRifas(prev => prev.filter(r => r.id !== id));
    setSnackbar({ open: true, message: 'Rifa eliminada', severity: 'error' });
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
                {/* <TableCell sx={{ color: '#fff' }}>Foto</TableCell> */}
                <TableCell sx={{ color: "#fff" }}>Título</TableCell>
                <TableCell sx={{ color: "#fff" }}>Fecha</TableCell>
                <TableCell sx={{ color: "#fff" }}>Hora</TableCell>
                <TableCell sx={{ color: "#fff" }}>Precio</TableCell>
                {/* <TableCell sx={{ color: '#fff' }}>Ubicación</TableCell> */}
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
                    {/* <TableCell>
                {row.fotoRifa && (
                  <Box
                    component="img"
                    src={row.fotoRifa}
                    alt="rifa"
                    sx={{ height: 40, borderRadius: 1 }}
                  />
                )}
              </TableCell> */}
                    <TableCell>{row.titulo}</TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>${row.precio}</TableCell>
                    {/* <TableCell>{row.ubicacion}</TableCell> */}
                    <TableCell>{row.boletosDisponibles}</TableCell>
                    <TableCell align="center">
                      {/* Editar: icono azul */}
                      <IconButton
                        size="small"
                        onClick={() => openFormDialog(row)}
                        sx={{ color: "blue" }}
                      >
                        <EditIcon />
                      </IconButton>

                      {/* Eliminar: mantiene el color por defecto de “error” */}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(row.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>

                      {/* Ver: icono verde */}
                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(row)}
                        sx={{ color: "green" }}
                      >
                        <VisibilityIcon />
                      </IconButton>

                      {/* Estadísticas: fondo morado y icono blanco */}

                      <IconButton
                        color="secondary"
                        sx={{ p: 0.5 }}
                        onClick={() => {
                          // Aquí iría la lógica (por ahora solo un console.log)
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
            {/* ----------------------------------------------------
         FOTO DE RIFA: aquí envolvemos la img en un contenedor
         con ancho 100% y alto fijo (200px, por ejemplo).
         ---------------------------------------------------- */}
            <Grid item xs={12} sm={6}>
              <Button component="label" startIcon={<PhotoCamera />} fullWidth>
                Foto de Rifa
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  name="fotoRifa"
                  onChange={handleFileChange}
                />
              </Button>

              {/* Contenedor fijo  */}
              <Box
                sx={{
                  width: "100%",
                  height: 200, // ← altura fija
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
                    src={formData.fotoRifa}
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

            {/* ----------------------------------------------------
         RESTO DE CAMPOS (Título, Descripción, Fecha, etc.)
         ---------------------------------------------------- */}
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

            {/* ----------------------------------------------------
         Nuevo bloque para “Productos a Rifar”
         ---------------------------------------------------- */}
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

                {/* --------------------------------------------------
             FOTO DEL PRODUCTO: igual envolvemos en un Box fijo
             -------------------------------------------------- */}
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
                      onChange={(e) =>
                        updateProduct(
                          prod.id,
                          "foto",
                          URL.createObjectURL(e.target.files[0])
                        )
                      }
                    />
                  </Button>
                  <Box
                    sx={{
                      width: "100%",
                      height: 150, // ← altura fija para cada foto de producto
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
            {/* ----------------------------------------------------
         FOTO DE RIFA (solo lectura), contenedor fijo 200px
         ---------------------------------------------------- */}
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

            {/* ----------------------------------------------------
         CAMPOS PRINCIPALES (solo lectura)
         ---------------------------------------------------- */}
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

            {/* ----------------------------------------------------
         LISTA DE PRODUCTOS A RIFAR (solo lectura)
         ---------------------------------------------------- */}
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
                {/* FOTO DEL PRODUCTO (solo lectura), contenedor fijo 150px */}
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