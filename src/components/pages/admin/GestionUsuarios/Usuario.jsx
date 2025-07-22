// src/pages/admin/GestionUsuarios/Usuario.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Alert,
  AlertTitle,
  Snackbar,
  Tooltip,
  Button,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  MenuItem,
  CircularProgress
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from 'react-router-dom';
import { api } from "../../../../config/apiConfig";

function Usuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estados para datos del usuario
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para controlar qué campos están en modo edición
  const [editingFields, setEditingFields] = useState({});
  
  // Estados para valores temporales mientras se edita
  const [tempValues, setTempValues] = useState({});
  
  // ✅ ESTADO PARA ERRORES DE VALIDACIÓN POR CAMPO
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Estados para alertas
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [openAlert, setOpenAlert] = useState(false);

  // Estado para las pestañas
  const [selectedTab, setSelectedTab] = useState(0);

  // Estados para catálogos
  const [catalogos, setCatalogos] = useState({
    universidades: [],
    programas: [],
    niveles: [],
    puestos: [],
    roles: []
  });

  // Opciones estáticas
  const generoOptions = ["Masculino", "Femenino"];
  const estatusOptions = ["Activo", "Inactivo", "Permiso"];

  // Cargar datos del usuario y catálogos
  useEffect(() => {
    loadUserData();
    loadCatalogos();
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/usuarios/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.usuario);
      } else {
        showAlert('error', data.error || 'Error al cargar datos del usuario');
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      showAlert('error', 'Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const response = await api.get('/api/usuarios/catalogos/all');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCatalogos(data.catalogos);
      }
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setOpenAlert(true);
  };

  // Función para manejar el cambio de pestañas
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // ✅ FUNCIÓN CORREGIDA PARA ACTIVAR EDICIÓN
  const handleEditField = (fieldName) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    // ✅ INICIALIZAR VALOR TEMPORAL SIN SOBREESCRIBIR
    setTempValues(prev => {
      // Solo establecer si no existe ya en tempValues
      if (!(fieldName in prev)) {
        return {
          ...prev,
          [fieldName]: userData[fieldName] || ""
        };
      }
      return prev;
    });
    
    // ✅ LIMPIAR ERROR ANTERIOR
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  // ✅ VALIDACIONES MEJORADAS
  const validateField = (fieldName, value) => {
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]+$/;
    
    switch (fieldName) {
      case 'nombre':
      case 'apellido_paterno':
      case 'apellido_materno':
        if (!value || value.trim().length < 2) {
          return 'Debe tener al menos 2 caracteres';
        }
        if (!nameRegex.test(value)) {
          return 'Solo se permiten letras y espacios';
        }
        break;
        
      case 'correo_electronico':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Formato de correo electrónico inválido';
        }
        break;
        
      case 'telefono':
        if (!/^\d{10}$/.test(value)) {
          return 'El teléfono debe tener exactamente 10 dígitos';
        }
        break;
        
      case 'curp':
        if (!/^[A-ZÑ]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i.test(value)) {
          return 'Formato de CURP inválido';
        }
        break;
        
      case 'numero_trabajador':
        if (!/^[0-9]+$/.test(value)) {
          return 'Solo se permiten números';
        }
        break;
        
      default:
        break;
    }
    return null;
  };

  // ✅ FUNCIÓN CORREGIDA PARA GUARDAR
  const handleSaveField = async (fieldName) => {
    const value = tempValues[fieldName];
    
    // ✅ VALIDAR Y MOSTRAR ERROR EN EL CAMPO
    const validationError = validateField(fieldName, value);
    if (validationError) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: validationError
      }));
      return;
    }
    
    // ✅ LIMPIAR ERROR SI VALIDACIÓN PASA
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
    
    try {
      const response = await api.put(`/api/usuarios/${id}/campo`, {
        campo: fieldName,
        valor: value
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: errorData.error || 'Error del servidor'
        }));
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // ✅ ACTUALIZAR DATOS LOCALMENTE
        setUserData(prev => ({
          ...prev,
          [fieldName]: value
        }));
        
        setEditingFields(prev => ({
          ...prev,
          [fieldName]: false
        }));
        
        showAlert('success', 'Campo actualizado correctamente');
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: data.error || 'Error al actualizar el campo'
        }));
      }
    } catch (error) {
      console.error('Error guardando campo:', error);
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: 'Error al guardar los cambios'
      }));
    }
  };

  // ✅ FUNCIÓN CORREGIDA PARA CANCELAR
  const handleCancelEdit = (fieldName) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: false
    }));
    setTempValues(prev => {
      const newTempValues = { ...prev };
      delete newTempValues[fieldName];
      return newTempValues;
    });
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  // ✅ FUNCIÓN CORREGIDA PARA CAMBIOS TEMPORALES
  const handleTempValueChange = (fieldName, value) => {
    setTempValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // ✅ LIMPIAR ERROR MIENTRAS ESCRIBE
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  // Función para cerrar alertas
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  // Función para redirigir a gestión de roles
  const handleManageRoles = () => {
    navigate('/gestion-roles');
  };

  // Función para volver atrás
  const handleGoBack = () => {
    navigate('/gestion-usuarios');
  };

  // ✅ COMPONENTE EDITABLEFIELD CORREGIDO
  const EditableField = ({ 
    label, 
    fieldName, 
    value, 
    type = "text", 
    options = null,
    disabled = false,
    specialAction = null,
    catalogKey = null
  }) => {
    const isEditing = editingFields[fieldName];
    const hasError = Boolean(fieldErrors[fieldName]);
    
    // ✅ MANEJO CORRECTO DE VALORES - PROBLEMA SOLUCIONADO
    let displayValue = "";
    if (isEditing) {
      // Si está editando, usar tempValues o el valor original como fallback
      displayValue = fieldName in tempValues ? tempValues[fieldName] : (value || "");
    } else {
      // Si no está editando, mostrar el valor original
      displayValue = value || "";
    }

    // Para campos que usan catálogos, obtener las opciones
    let selectOptions = options;
    if (catalogKey && catalogos[catalogKey]) {
      selectOptions = catalogos[catalogKey];
    }

    return (
      <TextField
        label={label}
        variant="outlined"
        fullWidth
        size="small"
        margin="dense"
        type={type}
        value={displayValue}
        onChange={(e) => handleTempValueChange(fieldName, e.target.value)}
        disabled={disabled}
        select={selectOptions !== null}
        error={hasError}
        helperText={fieldErrors[fieldName] || ''}
        InputLabelProps={{
          shrink: type === 'date' || type === 'email' || Boolean(displayValue) || isEditing
        }}
        InputProps={{
          readOnly: !isEditing,
          endAdornment: (
            <InputAdornment position="end">
              {specialAction ? (
                <Tooltip title="Gestionar Roles">
                  <IconButton size="small" onClick={specialAction}>
                    <ManageAccountsIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  {!isEditing ? (
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditField(fieldName)}
                        disabled={disabled}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Guardar">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleSaveField(fieldName)}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleCancelEdit(fieldName)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </>
              )}
            </InputAdornment>
          ),
        }}
      >
        {selectOptions && selectOptions.map((option) => (
          <MenuItem 
            key={catalogKey ? option.id : option} 
            value={catalogKey ? option.id : option}
          >
            {catalogKey ? option.nombre : option}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando datos del usuario...</Typography>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8, textAlign: 'center' }}>
        <Typography variant="h6">Usuario no encontrado</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Volver a Gestión de Usuarios
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* Botón para volver */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          variant="outlined"
        >
          Volver a Gestión de Usuarios
        </Button>
      </Box>

      <Card sx={{ boxShadow: 5, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
            Perfil del Usuario
          </Typography>

          {/* Sección de foto de perfil (no editable) */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              src={userData.url_foto || ""}
              sx={{
                bgcolor: userData.url_foto ? "transparent" : deepOrange[500],
                width: 100,
                height: 100,
                fontSize: "2rem",
              }}
            >
              {!userData.url_foto ? userData.nombre?.charAt(0) : ""}
            </Avatar>

            <Typography variant="h6" sx={{ mt: 1 }}>
              {`${userData.nombre || ''} ${userData.apellido_paterno || ''} ${userData.apellido_materno || ''}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              #{userData.numero_sindicalizado}
            </Typography>
          </Box>

          {/* Menú de pestañas */}
          <Box sx={{ width: "100%", bgcolor: "background.paper", mb: 2 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              centered
              sx={{ "& .MuiTabs-indicator": { backgroundColor: "#28a745" } }}
            >
              <Tab label="Datos Personales" sx={{ "&.Mui-selected": { color: "#28a745" } }} />
              <Tab label="Datos Laborales" sx={{ "&.Mui-selected": { color: "#28a745" } }} />
              <Tab label="Datos Sindicales" sx={{ "&.Mui-selected": { color: "#28a745" } }} />
            </Tabs>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* DATOS PERSONALES */}
          {selectedTab === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Nombre"
                    fieldName="nombre"
                    value={userData.nombre}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Apellido Paterno"
                    fieldName="apellido_paterno"
                    value={userData.apellido_paterno}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Apellido Materno"
                    fieldName="apellido_materno"
                    value={userData.apellido_materno}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Fecha de Nacimiento"
                    fieldName="fecha_nacimiento"
                    value={userData.fecha_nacimiento}
                    type="date"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Correo Electrónico"
                    fieldName="correo_electronico"
                    value={userData.correo_electronico}
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Número de Teléfono"
                    fieldName="telefono"
                    value={userData.telefono}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Género"
                    fieldName="genero"
                    value={userData.genero}
                    options={generoOptions}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="CURP"
                    fieldName="curp"
                    value={userData.curp}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* DATOS LABORALES */}
          {selectedTab === 1 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Programa Educativo"
                    fieldName="programa_id"
                    value={userData.programa_id}
                    catalogKey="programas"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Puesto"
                    fieldName="puesto_id"
                    value={userData.puesto_id}
                    catalogKey="puestos"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Universidad"
                    fieldName="universidad_id"
                    value={userData.universidad_id}
                    catalogKey="universidades"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Número de Trabajador"
                    fieldName="numero_trabajador"
                    value={userData.numero_trabajador}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Nivel Educativo"
                    fieldName="nivel_id"
                    value={userData.nivel_id}
                    catalogKey="niveles"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* DATOS SINDICALES */}
          {selectedTab === 2 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Número Sindicalizado"
                    fieldName="numero_sindicalizado"
                    value={userData.numero_sindicalizado}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Rol en el Sindicato"
                    fieldName="rol_sindicato_id"
                    value={userData.rol_sindicato_id}
                    catalogKey="roles"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Estatus"
                    fieldName="estatus"
                    value={userData.estatus}
                    options={estatusOptions}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Antigüedad"
                    fieldName="antiguedad"
                    value={userData.antiguedad}
                    type="date"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EditableField
                    label="Puesto en el Sindicato"
                    fieldName="puesto_sindicato"
                    value={userData.puesto_sindicato || "Sin asignar"}
                    disabled={true}
                    specialAction={handleManageRoles}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar para alertas */}
      <Snackbar
        open={openAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: "100%" }}>
          {alertType === "error" && <AlertTitle>Error</AlertTitle>}
          {alertType === "success" && <AlertTitle>Éxito</AlertTitle>}
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Usuario;