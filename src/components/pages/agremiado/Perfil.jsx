// src/pages/agremiado/Perfil.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Switch,
  FormControlLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


// Asegura que axios envíe la cookie authToken
axios.defaults.withCredentials = true;

function Perfil() {
  // Estado para almacenar los datos reales del usuario (inicialmente null, se carga desde el API)
  const [userData, setUserData] = useState(null);

  // Estados para foto de perfil y alertas
  const [photo, setPhoto] = useState("");
  const [preview, setPreview] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [openAlert, setOpenAlert] = useState(false);

  // Estado para las pestañas
  const [selectedTab, setSelectedTab] = useState(0);

  // Estados para autenticación de dos factores (2FA)
  const [twoFactorConfigured, setTwoFactorConfigured] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Estados para el diálogo de código de recuperación
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  // Estilo para textos multilínea
  const multilineStyle = {
    whiteSpace: "normal",
    wordWrap: "break-word",
  };

  // Manejo de pestañas
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
 // 1. Seleccionar foto y previsualizar
 const handleSelectPhoto = e => {
  const file = e.target.files[0];
  if (!file) return;
  const validFormats = ["image/jpeg", "image/png"];
  if (!validFormats.includes(file.type)) {
    setAlertMessage("Formato no válido. Solo JPEG/PNG.");
    setAlertType("error");
    setOpenAlert(true);
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    setAlertMessage("Máx. 2 MB.");
    setAlertType("error");
    setOpenAlert(true);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    setPreview(reader.result);
    setPhoto(file);
  };
  reader.readAsDataURL(file);
};

// 2. Guardar foto en backend protegido
const handleSavePhoto = async () => {
  if (!photo) {
    setAlertMessage("No has seleccionado imagen.");
    setAlertType("error");
    setOpenAlert(true);
    return;
  }
  try {
    const formData = new FormData();
    formData.append("imagen", photo);

    const { data } = await axios.post(
      "http://localhost:3001/api/perfilAgremiado/foto",
      formData
    );

    // Actualiza URL de foto en el estado
    setUserData(prev => ({
      ...prev,
      url_foto: data.urlFoto
    }));
    setAlertMessage("Foto actualizada correctamente.");
    setAlertType("success");
    setOpenAlert(true);
    setPhoto("");
    setPreview("");
  } catch (error) {
    console.error(error);
    setAlertMessage("Error al guardar la foto.");
    setAlertType("error");
    setOpenAlert(true);
  }
};

  // Función para cancelar la selección y volver a la foto actual (de la BD)
  const handleCancelPhoto = () => {
    setPhoto("");
    setPreview("");
  };

  // --- Sección de 2FA ---
  const handleEnableTwoFactor = () => {
    setOtpInput("");
    setShowTwoFactorSetup(true);
  };

  const handleTwoFactorValidate = () => {
    if (!/^\d{6}$/.test(otpInput)) {
      setAlertMessage("El código de verificación debe ser de 6 dígitos numéricos.");
      setAlertType("error");
      setOpenAlert(true);
      return;
    }
    // Simular generación de código de recuperación de 8 dígitos
    const generatedRecoveryCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    setRecoveryCode(generatedRecoveryCode);
    setShowRecoveryDialog(true);
  };

  const handleRecoveryAccept = () => {
    setTwoFactorConfigured(true);
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    setShowRecoveryDialog(false);
    setAlertMessage("Autenticación de dos factores activada correctamente.");
    setAlertType("success");
    setOpenAlert(true);
  };

  const renderTwoFactorSetup = () => (
    <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, mt: 2, maxWidth: 300, mx: "auto" }}>
      <Typography variant="h6" align="center">
        Configurar aplicación de autenticación
      </Typography>
      {/* Placeholder para el código QR */}
      <Box
        sx={{
          border: "1px dashed #aaa",
          width: 200,
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          my: 2,
          mx: "auto"
        }}
      >
        <Typography variant="body2">Código QR</Typography>
      </Box>
      <TextField
        fullWidth
        size="small"
        label="Código de verificación"
        type="password"
        placeholder="••••••"
        value={otpInput}
        onChange={(e) => setOtpInput(e.target.value)}
        margin="dense"
        error={otpInput && !/^\d{6}$/.test(otpInput)}
        helperText={otpInput && !/^\d{6}$/.test(otpInput) ? "Debe contener 6 dígitos numéricos." : ""}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end">
                <VisibilityOff />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Button variant="contained" onClick={handleTwoFactorValidate} sx={{ width: "70%", mx: "auto" }}>
          Validar
        </Button>
      </Box>
    </Box>
  );

  const renderRecoveryDialog = () => (
    <Dialog
      open={showRecoveryDialog}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setShowRecoveryDialog(false)}
      aria-describedby="recovery-dialog-description"
    >
      <DialogTitle>{"Código de Recuperación"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="recovery-dialog-description">
          Guarda este código en un lugar seguro. Si en algún momento pierdes tu dispositivo o eliminas la aplicación,
          podrás usar este código para recuperar el acceso.
          <br /><br />
          <strong>{recoveryCode}</strong>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRecoveryAccept}>Aceptar</Button>
      </DialogActions>
    </Dialog>
  );

  const renderAccessSection = () => {
    if (!twoFactorConfigured) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Autenticación de dos factores
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            La autenticación de dos factores no está habilitada. Añade una capa adicional de seguridad a tu cuenta.
          </Typography>
          {!showTwoFactorSetup && (
            <Button variant="contained" color="primary" onClick={handleEnableTwoFactor} sx={{ mx: "auto" }}>
              Habilitar autenticación de dos factores
            </Button>
          )}
          {showTwoFactorSetup && renderTwoFactorSetup()}
          {showRecoveryDialog && renderRecoveryDialog()}
        </Box>
      );
    } else {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Acceso
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={(e) => {
                  setTwoFactorEnabled(e.target.checked);
                  setAlertMessage(
                    e.target.checked
                      ? "La autenticación de dos factores está activada."
                      : "La autenticación de dos factores está desactivada."
                  );
                  setAlertType("info");
                  setOpenAlert(true);
                }}
                color="primary"
              />
            }
            label="Autenticación de dos factores"
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleEnableTwoFactor}>
              Editar autenticación 2FA
            </Button>
          </Box>
        </Box>
      );
    }
  };

 // --- fetch del perfil usando la cookie JWT ---
 useEffect(() => {
  axios.get("http://localhost:3001/api/perfilAgremiado")
    .then(({ data }) => setUserData(data))
    .catch(err => {
      console.error("Error al cargar perfil", err);
    });
}, []);

if (!userData) {
  return (
    <Container maxWidth="md" sx={{ mt:4, mb:8 }}>
      <Typography variant="h6" align="center">Cargando datos...</Typography>
    </Container>
  );
}

  if (!userData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h6" align="center">
          Cargando datos...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 15, mb: 8 }}>
      <Card sx={{ boxShadow: 5, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
            Perfil del Agremiado
          </Typography>

          {/* Sección de foto de perfil */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              {/* Avatar que muestra la previsualización (si existe) o la foto guardada en la BD */}
              <Avatar
                src={preview || userData.url_foto || ""}
                sx={{
                  bgcolor: preview || userData.url_foto ? "transparent" : deepOrange[500],
                  width: 100,
                  height: 100,
                  fontSize: "2rem",
                }}
              >
                {(!preview && !userData.url_foto) ? userData.nombre?.charAt(0) : ""}
              </Avatar>

              {/* Botón para cambiar foto */}
              <Tooltip title="Cambiar foto de perfil">
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <CameraAltIcon />
                  <input hidden accept="image/jpeg,image/png" type="file" onChange={handleSelectPhoto} />
                </IconButton>
              </Tooltip>
            </Box>

            <Typography variant="h6" sx={{ mt: 1 }}>
              {`${userData.nombre} ${userData.apellido_paterno} ${userData.apellido_materno}`}
            </Typography>

            {/* Si se seleccionó una nueva foto, mostrar botones "Guardar" (verde) y "Cancelar" */}
            {preview && (
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button variant="outlined" color="success" onClick={handleSavePhoto}>
                  Guardar
                </Button>
                <Button variant="outlined" color="error" onClick={handleCancelPhoto}>
                  Cancelar
                </Button>
              </Box>
            )}
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
              <Tab label="Acceso" sx={{ "&.Mui-selected": { color: "#28a745" } }} />
            </Tabs>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* DATOS PERSONALES */}
          {selectedTab === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.nombre}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Apellido Paterno"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.apellido_paterno}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Apellido Materno"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.apellido_materno}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de Nacimiento"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.fecha_nacimiento}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Correo Electrónico"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.correo_electronico}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Número de Teléfono"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.telefono}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Género"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.genero}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="CURP"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.curp}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* DATOS LABORALES */}
          {selectedTab === 1 && (
            <Box>
              <Grid container spacing={2}>
                {userData.programa_educativo && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Programa Educativo"
                      variant="outlined"
                      fullWidth
                      size="small"
                      margin="dense"
                      value={userData.programa_educativo}
                      InputProps={{ readOnly: true, style: multilineStyle }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Puesto"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.puesto}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Universidad de Procedencia"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.universidad}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Número de Trabajador"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.numero_trabajador}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nivel Educativo"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.nivel_educativo}
                    InputProps={{ readOnly: true, style: multilineStyle }}
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
                  <TextField
                    label="Número Sindicalizado"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.numero_sindicalizado}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rol en el Sindicato"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.rol_sindicato}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Estatus"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={userData.status}
                    InputProps={{ readOnly: true, style: multilineStyle }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ACCESO Y 2FA */}
          {selectedTab === 3 && renderAccessSection()}
        </CardContent>
      </Card>

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

export default Perfil;
