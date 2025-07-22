// GestionUsuarios.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Tooltip,
  InputAdornment,
  FormControl,
  Select,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';

import { api } from "../../../../config/apiConfig";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const GestionUsuarios = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  

  // Estados de búsqueda y filtros
  const [searchName, setSearchName] = useState("");
  const [filterRole, setFilterRole] = useState("Todos");

  // Estados de datos
  const [unregisteredUsers, setUnregisteredUsers] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Estados para el diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    birthDate: "",
    role: "agremiado",
    excelFile: null,
  });

  // Estados para alerts y feedback
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Estados para confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState({ id: null, isRegistered: false, name: "" });

  // Opciones para filtros
  const roleOptions = ["Todos", "Agremiado", "Admin"];

  // Función para navegar al perfil del usuario:
const handleViewProfile = (userId) => {
  navigate(`/usuario/${userId}`);
};

  // Función para mostrar alerts
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: 'info', message: '' }), 5000);
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        loadUnregisteredUsers(),
        loadRegisteredUsers(),
        loadEstadisticas()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showAlert('error', 'Error al cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  // Cargar usuarios preregistrados
  const loadUnregisteredUsers = async () => {
    try {
      const response = await api.get('/api/usuarios/preregistrados');
      const data = await response.json();
      
      if (data.success) {
        setUnregisteredUsers(data.usuarios);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error cargando usuarios preregistrados:', error);
      showAlert('error', 'Error al cargar usuarios preregistrados');
    }
  };

  // Cargar usuarios registrados
  const loadRegisteredUsers = async () => {
    try {
      const response = await api.get('/api/usuarios/registrados');
      const data = await response.json();
      
      if (data.success) {
        setRegisteredUsers(data.usuarios);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error cargando usuarios registrados:', error);
      showAlert('error', 'Error al cargar usuarios registrados');
    }
  };

  // Cargar estadísticas
  const loadEstadisticas = async () => {
    try {
      const response = await api.get('/api/usuarios/estadisticas');
      const data = await response.json();
      
      if (data.success) {
        setEstadisticas(data.estadisticas);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Handlers para tabs y paginación
  const handleChangeTab = (_, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Filtrado de datos
  const filteredRegistered = registeredUsers
    .filter(row => {
      const fullName = `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno}`.toLowerCase();
      return fullName.includes(searchName.toLowerCase());
    })
    .filter(row => filterRole === "Todos" || row.rol_sindicato === filterRole);

  const filteredUnregistered = unregisteredUsers
    .filter(row => row.correo_electronico.toLowerCase().includes(searchName.toLowerCase()));

  // Handlers del diálogo
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ email: "", birthDate: "", role: "agremiado", excelFile: null });
  };

  // Agregar usuario individual
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Si hay archivo Excel, procesar archivo
      if (formData.excelFile) {
        await handleExcelUpload();
      } else {
        // Agregar usuario individual
        const response = await api.post('/api/usuarios/agregar-individual', {
          correo_electronico: formData.email,
          fecha_nacimiento: formData.birthDate,
          rol: formData.role
        });

        const data = await response.json();

        if (data.success) {
          showAlert('success', data.mensaje);
          await loadUnregisteredUsers();
          await loadEstadisticas();
          handleCloseDialog();
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', error.message || 'Error al agregar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Procesar archivo Excel
  const handleExcelUpload = async () => {
    if (!formData.excelFile) {
      showAlert('error', 'Debe seleccionar un archivo Excel');
      return;
    }

    setUploadProgress(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('excelFile', formData.excelFile);

      const response = await api.post('/api/usuarios/procesar-excel', formDataUpload);
      const data = await response.json();

      if (data.success) {
        setUploadResults(data);
        setShowUploadDialog(true);
        await loadUnregisteredUsers();
        await loadEstadisticas();
        handleCloseDialog();
        showAlert('success', `Archivo procesado: ${data.resumen.exitosos} usuarios agregados`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      showAlert('error', error.message || 'Error al procesar archivo Excel');
    } finally {
      setUploadProgress(false);
    }
  };

  // Eliminar usuario
  const handleDeleteClick = (id, isRegistered) => {
    let userName = "";
    if (isRegistered) {
      const user = registeredUsers.find(row => row.id === id);
      userName = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`;
    } else {
      const user = unregisteredUsers.find(row => row.id === id);
      userName = user.correo_electronico;
    }
    setUserToDelete({ id, isRegistered, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
  try {
    setLoading(true);
    
    const response = await api.delete(`/api/usuarios/${userToDelete.id}`);
    const data = await response.json();

    if (data.success) {
      showAlert('success', data.mensaje);
      
      // Recargar datos según el tipo de usuario eliminado
      if (userToDelete.isRegistered) {
        await loadRegisteredUsers();
      } else {
        await loadUnregisteredUsers();
      }
      
      await loadEstadisticas();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    showAlert('error', error.message || 'Error al eliminar usuario');
  } finally {
    setLoading(false);
    setDeleteDialogOpen(false);
    setUserToDelete({ id: null, isRegistered: false, name: "" });
  }
};


  if (loadingData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando datos...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        Gestión de Usuarios
      </Typography>

      {/* Alert de feedback */}
      {alert.show && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert({ show: false, type: 'info', message: '' })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Estadísticas con colores */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography color="inherit" gutterBottom sx={{ opacity: 0.9 }}>
                Total Usuarios
              </Typography>
              <Typography variant="h4" color="inherit" sx={{ fontWeight: 'bold' }}>
                {estadisticas.total_usuarios || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography color="inherit" gutterBottom sx={{ opacity: 0.9 }}>
                Registrados
              </Typography>
              <Typography variant="h4" color="inherit" sx={{ fontWeight: 'bold' }}>
                {estadisticas.usuarios_registrados || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF9800 0%, #f57c00 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography color="inherit" gutterBottom sx={{ opacity: 0.9 }}>
                Preregistrados
              </Typography>
              <Typography variant="h4" color="inherit" sx={{ fontWeight: 'bold' }}>
                {estadisticas.usuarios_preregistrados || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F3 0%, #1976d2 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography color="inherit" gutterBottom sx={{ opacity: 0.9 }}>
                Activos
              </Typography>
              <Typography variant="h4" color="inherit" sx={{ fontWeight: 'bold' }}>
                {estadisticas.usuarios_activos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de controles */}
      <Paper sx={{ p: 1.5, mb: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenDialog}
          disabled={loading}
        >
          Agregar Usuario
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Actualizar
        </Button>
        
        <TextField
          label="Buscar por nombre"
          value={searchName}
          onChange={(e) => { setSearchName(e.target.value); setPage(0); }}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {tabValue === 1 && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
              displayEmpty
            >
              {roleOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Progress bar para operaciones */}
      {(loading || uploadProgress) && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Pestañas */}
      <Box sx={{ width: "100%" }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab} 
          centered 
          textColor="primary" 
          indicatorColor="primary"
        >
          <Tab label={`Usuarios sin Registrar (${filteredUnregistered.length})`} />
          <Tab label={`Usuarios Registrados (${filteredRegistered.length})`} />
        </Tabs>

        {/* Tab Panel - Usuarios sin registrar */}
        <TabPanel value={tabValue} index={0}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f44336' }}>
                    <TableCell sx={{ color: '#fff' }}>Número Sindicalizado</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Correo</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Fecha Nacimiento</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Fecha Creación</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                    <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUnregistered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.numero_sindicalizado}</TableCell>
                        <TableCell>{row.correo_electronico}</TableCell>
                        <TableCell>{new Date(row.fecha_nacimiento).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(row.fecha_creacion).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.estatus} 
                            size="small" 
                            color={row.estatus === 'Activo' ? 'success' : 'error'}
                          />
                        </TableCell>
                    <TableCell align="center">
   <Tooltip title="Ver Perfil">
    <IconButton 
      size="small"
      onClick={() => handleViewProfile(row.id)}
    >
      <PersonIcon />
    </IconButton>
  </Tooltip>
  <Tooltip title="Eliminar Usuario">
    <IconButton 
      color="error" 
      size="small"
      onClick={() => handleDeleteClick(row.id, false)} 
      disabled={loading}
    >
      <DeleteIcon />
    </IconButton>
  </Tooltip>
</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredUnregistered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </TabPanel>

        {/* Tab Panel - Usuarios registrados */}
        <TabPanel value={tabValue} index={1}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#4caf50' }}>
                    <TableCell sx={{ color: '#fff' }}>Nombre Completo</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Email</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Teléfono</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Universidad</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Nivel Educativo</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Rol</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                    <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                 
                   {filteredRegistered
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((row) => (
    <TableRow key={row.id} hover>
      <TableCell>
        {`${row.nombre} ${row.apellido_paterno} ${row.apellido_materno}`}
      </TableCell>
      <TableCell>{row.correo_electronico}</TableCell>
      <TableCell>{row.telefono}</TableCell>
      <TableCell>{row.universidad}</TableCell>
      <TableCell>{row.nivel_educativo}</TableCell>
      <TableCell>
        <Chip 
          label={row.rol_sindicato} 
          size="small" 
          color={row.rol_sindicato === 'Admin' ? 'primary' : 'default'}
        />
      </TableCell>
      <TableCell>
        <Chip 
          label={row.estatus} 
          size="small" 
          color={row.estatus === 'Activo' ? 'success' : 'error'}
        />
      </TableCell>
      <TableCell align="center">
       <Tooltip title="Ver Perfil">
  <IconButton 
    size="small"
    onClick={() => handleViewProfile(row.id)}
  >
    <PersonIcon />
  </IconButton>
</Tooltip>
        <Tooltip title="Eliminar Usuario">
          <IconButton 
            color="error" 
            size="small"
            onClick={() => handleDeleteClick(row.id, true)}
            disabled={loading}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredRegistered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </TabPanel>
      </Box>

      {/* Diálogo para agregar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Agregar Usuario
          {uploadProgress && <LinearProgress sx={{ mt: 1 }} />}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit} id="add-user-form">
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Opción 1: Usuario Individual
            </Typography>
            <TextField
              margin="dense"
              label="Correo Electrónico"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={formData.excelFile}
            />
            <TextField
              margin="dense"
              label="Fecha de Nacimiento"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={formData.excelFile}
            />
            <TextField
              margin="dense"
              label="Rol"
              select
              fullWidth
              variant="outlined"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={formData.excelFile}
            >
              <MenuItem value="agremiado">Agremiado</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ mb: 1 }}>
              Opción 2: Archivo Excel Masivo
            </Typography>
            <TextField
              margin="dense"
              type="file"
              fullWidth
              variant="outlined"
              inputProps={{ 
                accept: ".xlsx,.xls",
                onChange: (e) => {
                  const file = e.target.files[0];
                  setFormData({ 
                    ...formData, 
                    excelFile: file,
                    // Limpiar campos individuales si se selecciona archivo
                    email: file ? "" : formData.email,
                    birthDate: file ? "" : formData.birthDate
                  });
                }
              }}
              helperText="Seleccione un archivo Excel (.xlsx, .xls) con columnas: correo_electronico, fecha_nacimiento"
            />
            {formData.excelFile && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Archivo seleccionado: {formData.excelFile.name}
              </Alert>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="warning" disabled={loading || uploadProgress}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            variant="contained"
            color="primary"
            disabled={loading || uploadProgress || (!formData.email && !formData.excelFile)}
            startIcon={formData.excelFile ? <UploadIcon /> : <PersonAddIcon />}
          >
            {formData.excelFile ? 'Procesar Excel' : 'Agregar Individual'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de resultados de carga masiva */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Resultados de Carga Masiva</DialogTitle>
        <DialogContent>
          {uploadResults && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary">Total</Typography>
                      <Typography variant="h4">{uploadResults.resumen.total_filas}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="success.main">Exitosos</Typography>
                      <Typography variant="h4" color="success.main">
                        {uploadResults.resumen.exitosos}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="error.main">Errores</Typography>
                      <Typography variant="h4" color="error.main">
                        {uploadResults.resumen.errores}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="warning.main">Duplicados</Typography>
                      <Typography variant="h4" color="warning.main">
                        {uploadResults.resumen.duplicados}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Detalles:</Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {uploadResults.detalles.map((detalle, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {detalle.error ? (
                        <ErrorIcon color="error" />
                      ) : detalle.mensaje?.includes('ya existe') ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <CheckCircleIcon color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Fila ${detalle.fila}`}
                      secondary={detalle.mensaje || detalle.error}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
  <DialogTitle>Confirmar Eliminación</DialogTitle>
  <DialogContent>
    <Typography>
      ¿Está seguro de eliminar al usuario <strong>{userToDelete.name}</strong>?
    </Typography>
    <Alert severity="warning" sx={{ mt: 2 }}>
      Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al usuario.
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
      Cancelar
    </Button>
    <Button color="error" onClick={handleConfirmDelete} disabled={loading}>
      {loading ? <CircularProgress size={20} /> : 'Eliminar'}
    </Button>
  </DialogActions>
</Dialog>
    </Container>
  );
};

export default GestionUsuarios;