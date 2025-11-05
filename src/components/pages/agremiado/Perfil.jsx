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
  Slide,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/apiConfig";
import PuntosDialog from "./PuntosDialog"; // al inicio del archivo
import LogrosDialog from "./LogrosDialog";
import RankingDialog from "./RankingDialog"; // Junto a PuntosDialog y LogrosDialog
import confetti from "canvas-confetti"; // ⬅️ agrégalo arriba del archivo (solo una vez)

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Asegura que axios envíe la cookie authToken
axios.defaults.withCredentials = true;

function Perfil() {
  // Estado para almacenar los datos reales del usuario (inicialmente null, se carga desde el API)
  const [userData, setUserData] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
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
  const handleSelectPhoto = (e) => {
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
        `${API_URL}/api/perfilAgremiado/foto`,
        formData
      );

      // Actualiza URL de foto en el estado
      setUserData((prev) => ({
        ...prev,
        url_foto: data.urlFoto,
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
      setAlertMessage(
        "El código de verificación debe ser de 6 dígitos numéricos."
      );
      setAlertType("error");
      setOpenAlert(true);
      return;
    }
    // Simular generación de código de recuperación de 8 dígitos
    const generatedRecoveryCode = Math.floor(
      10000000 + Math.random() * 90000000
    ).toString();
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
  // -------------- Estados y lógica para encuestas/votaciones --------------
  const [activeSurveys, setActiveSurveys] = useState([]); // Lista de encuestas/votaciones activas sin responder
  const [openPendingDialog, setOpenPendingDialog] = useState(false); // Controla el primer diálogo (aviso de pendientes)
  const [openListDialog, setOpenListDialog] = useState(false); // Controla el segundo diálogo (listado)
  const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
  const [selectedSurveyDetails, setSelectedSurveyDetails] = useState(null);
  const [answers, setAnswers] = useState({});

  // Función para formatear fecha+hora en español (igual a la que ya usas en AdminEncuestas)
  const formatDateTime = (dateStr, timeStr) => {
    // Si dateStr viene como "2025-06-04T06:00:00.000Z", nos quedamos solo con "2025-06-04"
    const datePart =
      typeof dateStr === "string" && dateStr.includes("T")
        ? dateStr.split("T")[0]
        : dateStr;

    const dt = new Date(`${datePart}T${timeStr}`);
    if (isNaN(dt)) {
      return "Fecha inválida";
    }
    const fechaFormateada = dt.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const [hh, mm] = timeStr.split(":");
    return `${fechaFormateada} a las ${hh}:${mm} hr`;
  };

  const handleOpenSurvey = async (id) => {
    try {
      // Traemos la lista completa (incluye preguntas y opciones anidadas)
      const { data: all } = await axios.get(
        `${API_URL}/api/encuestas-votaciones`
      );
      const survey = all.find((e) => e.id === id);
      if (survey) {
        setSelectedSurveyDetails(survey);
        setOpenListDialog(false);
        setOpenSurveyDialog(true);
      }
    } catch (err) {
      console.error("Error al cargar detalles de encuesta:", err);
    }
  };

  const renderTwoFactorSetup = () => (
    <Box
      sx={{
        p: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        mt: 2,
        maxWidth: 300,
        mx: "auto",
      }}
    >
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
          mx: "auto",
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
        helperText={
          otpInput && !/^\d{6}$/.test(otpInput)
            ? "Debe contener 6 dígitos numéricos."
            : ""
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end">
                <VisibilityOff />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Button
          variant="contained"
          onClick={handleTwoFactorValidate}
          sx={{ width: "70%", mx: "auto" }}
        >
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
          Guarda este código en un lugar seguro. Si en algún momento pierdes tu
          dispositivo o eliminas la aplicación, podrás usar este código para
          recuperar el acceso.
          <br />
          <br />
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
            La autenticación de dos factores no está habilitada. Añade una capa
            adicional de seguridad a tu cuenta.
          </Typography>
          {!showTwoFactorSetup && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnableTwoFactor}
              sx={{ mx: "auto" }}
            >
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
    // 1) Traemos datos del usuario
    axios
      .get(`${API_URL}/api/perfilAgremiado`)
      .then(({ data }) => {
        setUserData(data);

        // 2) Una vez que terminó de cargar userData, consultamos si hay encuestas/votaciones activas sin responder
        return axios.get(`${API_URL}/api/encuestas-votaciones/activas-usuario`);
      })
      .then(({ data: pendientes }) => {
        // Si vinieron encuestas/votaciones activas, abrimos el diálogo
        if (Array.isArray(pendientes) && pendientes.length > 0) {
          setActiveSurveys(pendientes);
          setOpenPendingDialog(true);
        }
      })
      .catch((err) => {
        console.error("Error al cargar perfil o encuestas activas:", err);
      });
  }, []);
  // Cada vez que openSuccessDialog pase a true, cierra el diálogo solo tras 4 segundos
  useEffect(() => {
    if (!openSuccessDialog) return;

    const timer = setTimeout(() => {
      setOpenSuccessDialog(false);
      if (activeSurveys.length > 0) {
        // quedan pendientes → volvemos al listado
        setOpenListDialog(true);
      } else {
        // ¡listo! sin pendientes → redirigimos a "/reuniones"
        navigate("/encuestas_votaciones");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [openSuccessDialog, activeSurveys, navigate]);

  if (!userData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h6" align="center">
          Cargando datos...
        </Typography>
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
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
          >
            Perfil del Agremiado
          </Typography>

 {/* Sección de foto de perfil - LAYOUT HORIZONTAL */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              gap: 6,
              flexWrap: "wrap",
              px: 2,
            }}
          >
            {/* LADO IZQUIERDO: Foto y nombre */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 200,
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={preview || userData.url_foto || ""}
                  sx={{
                    bgcolor:
                      preview || userData.url_foto
                        ? "transparent"
                        : deepOrange[500],
                    width: 100,
                    height: 100,
                    fontSize: "2rem",
                  }}
                >
                  {!preview && !userData.url_foto
                    ? userData.nombre?.charAt(0)
                    : ""}
                </Avatar>

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
                    <input
                      hidden
                      accept="image/jpeg,image/png"
                      type="file"
                      onChange={handleSelectPhoto}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="h6" sx={{ mt: 1, textAlign: "center" }}>
                {`${userData.nombre} ${userData.apellido_paterno} ${userData.apellido_materno}`}
              </Typography>

              {preview && (
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={handleSavePhoto}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleCancelPhoto}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>

          {/* LADO DERECHO: Botones de gamificación */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                minWidth: 320,
                flex: 1,
                maxWidth: 400,
              }}
            >
              {/* Ranking */}
              <Box sx={{ 
                transform: "scale(0.80)",
                transformOrigin: "center",
                mb: -4
              }}>
                <RankingDialog userId={userData.id} />
              </Box>
              
              {/* Puntos */}
              <Box sx={{ 
                transform: "scale(0.80)",
                transformOrigin: "center",
                mb: -4
              }}>
                <PuntosDialog userId={userData.id} />
              </Box>

              {/* Logros */}
              <Box sx={{ 
                transform: "scale(0.80)",
                transformOrigin: "center"
              }}>
                <LogrosDialog userId={userData.id} />
              </Box>
            </Box>
          </Box>

          {/* Menú de pestañas */}
          <Box sx={{ width: "100%", bgcolor: "background.paper", mb: 2 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              centered
              sx={{ "& .MuiTabs-indicator": { backgroundColor: "#28a745" } }}
            >
              <Tab
                label="Datos Personales"
                sx={{ "&.Mui-selected": { color: "#28a745" } }}
              />
              <Tab
                label="Datos Laborales"
                sx={{ "&.Mui-selected": { color: "#28a745" } }}
              />
              <Tab
                label="Datos Sindicales"
                sx={{ "&.Mui-selected": { color: "#28a745" } }}
              />
              <Tab
                label="Acceso"
                sx={{ "&.Mui-selected": { color: "#28a745" } }}
              />
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
      {/* ——— Primer diálogo: "Tienes encuestas/votaciones pendientes" ——— */}
      <Dialog
        open={openPendingDialog}
        disableEscapeKeyDown
        onClose={() => {}}
        aria-labelledby="pending-dialog-title"
      >
        <DialogTitle id="pending-dialog-title">
          Encuestas/Votaciones Pendientes
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tienes encuestas o votaciones pendientes por responder.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPendingDialog(false);
              setOpenListDialog(true);
            }}
            variant="contained"
            color="primary"
          >
            Contestar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ——— Segundo diálogo: Listado de encuestas/votaciones activas ——— */}
      <Dialog
        open={openListDialog}
        disableEscapeKeyDown
        onClose={() => {}}
        fullWidth
        maxWidth="md"
        aria-labelledby="list-dialog-title"
      >
        <DialogTitle id="list-dialog-title">
          Encuestas y Votaciones Activas
        </DialogTitle>
        <DialogContent dividers>
          {activeSurveys.map((item) => (
            <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {item.type} — {item.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                {item.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cierre: {formatDateTime(item.closeDate, item.closeTime)}
              </Typography>
              {/* Por ahora dejamos el botón sin funcionalidad extra; si quieres redirigir a un diálogo específico para contestar, reemplaza la lógica en onClick */}
              <Box sx={{ textAlign: "right", mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpenSurvey(item.id)}
                >
                  Contestarlo
                </Button>
              </Box>
            </Paper>
          ))}
        </DialogContent>
      </Dialog>
      {/* ——— Tercer diálogo: mostrar preguntas y opciones para responder ——— */}
      <Dialog
        open={openSurveyDialog}
        disableEscapeKeyDown
        onClose={() => {}}
        fullWidth
        maxWidth="md"
        aria-labelledby="survey-dialog-title"
      >
        <DialogTitle id="survey-dialog-title">
          {selectedSurveyDetails?.type} — {selectedSurveyDetails?.title}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSurveyDetails?.questions.map((q) => (
            <FormControl
              component="fieldset"
              key={q.id}
              sx={{ mb: 2, width: "100%" }}
            >
              <FormLabel component="legend" sx={{ mb: 1 }}>
                {q.text}
              </FormLabel>
              <RadioGroup
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
              >
                {q.options.map((opt) => (
                  <MuiFormControlLabel
                    key={opt.id}
                    value={opt.id.toString()}
                    control={<Radio />}
                    label={opt.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenSurveyDialog(false);
              setOpenListDialog(true);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                // 1) Construimos el arreglo de respuestas:
                const payload = {
                  encuesta_id: selectedSurveyDetails.id,
                  respuestas: Object.entries(answers).map(
                    ([preguntaId, opcionId]) => ({
                      pregunta_id: Number(preguntaId),
                      opcion_id: Number(opcionId),
                    })
                  ),
                };

                // 2) Hacemos POST al endpoint de respuestas:
                await axios.post(
                  `${API_URL}/api/encuestas-votaciones/respuestas`,
                  payload
                );

                // 4) Sacamos esta encuesta de la lista de pendientes:
                const nuevosPendientes = activeSurveys.filter(
                  (e) => e.id !== selectedSurveyDetails.id
                );
                setActiveSurveys(nuevosPendientes);
                // 5) Cerramos el diálogo de la encuesta concreta:
                setOpenSurveyDialog(false);
                setAnswers({});

                // 6) Preparamos el diálogo de éxito:
                setSuccessMessage(
                  `${selectedSurveyDetails.type} enviada correctamente`
                );
                setOpenSuccessDialog(true);
              } catch (err) {
                console.error("Error al enviar respuestas:", err);
                setAlertType("error");
                setAlertMessage("No se pudieron enviar las respuestas.");
                setOpenAlert(true);
              }
            }}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
      {/* ——— Diálogo de éxito con confeti y puntos sumados ——— */}

      <Dialog
        open={openSuccessDialog}
        aria-labelledby="success-dialog-title"
        PaperProps={{
          sx: {
            textAlign: "center",
            borderRadius: 3,
            p: 2,
            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
            background: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
          },
        }}
        TransitionComponent={Transition}
        onEntered={() => {
          // 🎉 Lanza confeti una vez al abrir el diálogo
          const duration = 1200;
          const end = Date.now() + duration;
          (function frame() {
            confetti({
              particleCount: 6,
              startVelocity: 25,
              spread: 360,
              ticks: 60,
              origin: { x: Math.random(), y: Math.random() - 0.2 },
              colors: ["#FF9800", "#FFB300", "#FFD54F", "#FFA726"],
            });
            if (Date.now() < end) requestAnimationFrame(frame);
          })();
        }}
      >
        <DialogTitle
          id="success-dialog-title"
          sx={{ fontWeight: "bold", color: "#E65100" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#43A047",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: "50%",
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              ✓
            </Box>
            <Typography variant="h6">¡Puntos Ganados!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 16, color: "#4E342E", mb: 1 }}>
            {successMessage}
          </Typography>
          <Typography sx={{ color: "#E65100", fontWeight: "bold" }}>
            🎉 Se han sumado puntos a tu cuenta.
          </Typography>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={openAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertType === "error" && <AlertTitle>Error</AlertTitle>}
          {alertType === "success" && <AlertTitle>Éxito</AlertTitle>}
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Perfil;
