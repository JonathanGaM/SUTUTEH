// RecuperarContrasena.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Link
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

// Definir endpoints de la API
const API_BASE_URL = "http://localhost:3001/api/recuperarContrasena";
const VERIFY_CORREO_CAPTCHA_URL = `${API_BASE_URL}/verificarCorreoCaptcha`;
const ENVIAR_CODIGO_URL = `${API_BASE_URL}/enviarCodigo`;
const VERIFICAR_CODIGO_URL = `${API_BASE_URL}/verificarCodigo`;
const ACTUALIZAR_CONTRASENA_URL = `${API_BASE_URL}/actualizarContrasena`;

const steps = [
  "Correo y Captcha",
  "Código de Verificación",
  "Nueva Contraseña"
];

function RecuperarContrasena() {
  // Estilos para inputs: en foco se usa un borde y etiqueta en verde claro
  const inputStyles = {
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#81c784"
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#81c784"
    }
  };

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paso 1
  const [email, setEmail] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);

  // Paso 2
  const [verificationCode, setVerificationCode] = useState("");
  const [counter, setCounter] = useState(60);

  // Paso 3: Contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // 🔹 Medidor de fortaleza de contraseña
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    commonPatterns: true
  });

  // Errores y Snackbar
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Función para calcular fortaleza de contraseña (misma lógica que en Registro.jsx)
  const getPasswordStrength = (pwd) => {
    const strength = {
      score: 0,
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
      commonPatterns: true
    };
    strength.length = pwd.length >= 8;
    strength.lowercase = /[a-z]/.test(pwd);
    strength.uppercase = /[A-Z]/.test(pwd);
    strength.number = /\d/.test(pwd);
    strength.special = /[@$!%*?&]/.test(pwd);
    // Evita patrones comunes
    strength.commonPatterns = !(pwd && /(.)\1{2,}|123|abc|password/i.test(pwd));

    let score = 0;
    if (strength.length) score++;
    if (strength.lowercase) score++;
    if (strength.uppercase) score++;
    if (strength.number) score++;
    if (strength.special) score++;
    if (score > 4) score = 4; // Máximo 4
    strength.score = score;
    return strength;
  };

  // Actualiza la fortaleza cada vez que cambie la contraseña
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(newPassword));
  }, [newPassword]);

  // Reiniciar temporizador cuando estamos en el paso 1 (verificación de código)
  useEffect(() => {
    if (activeStep === 1) {
      setCounter(60);
      const timer = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeStep]);

  // Scroll automático hacia arriba al cambiar de paso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  const toggleShowNewPassword = () => setShowNewPassword((prev) => !prev);
  const toggleShowConfirmNewPassword = () => setShowConfirmNewPassword((prev) => !prev);

  const handleNext = async () => {
    // Paso 0: Verificar correo y reCAPTCHA, enviar código
    if (activeStep === 0) {
      let newErrors = {};
      if (!email || !email.includes("@") || email.length < 5) {
        newErrors.email = "Ingrese un correo válido registrado.";
      }
      if (!captchaValue) {
        newErrors.captcha = "Verifique que no es un robot.";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      try {
        // Verificar correo y captcha en el backend
        await axios.post(VERIFY_CORREO_CAPTCHA_URL, {
          email,
          tokenCaptcha: captchaValue
        });
        // Enviar código de recuperación
        await axios.post(ENVIAR_CODIGO_URL, { email });
        setSnackbar({
          open: true,
          message: "Código de recuperación enviado a tu correo.",
          severity: "success"
        });
        setActiveStep(activeStep + 1);
      } catch (error) {
        setErrors({ email: error.response?.data?.error || "Error al verificar correo y captcha." });
      }
    }
    // Paso 1: Verificar código de verificación
    else if (activeStep === 1) {
      let newErrors = {};
      if (!/^\d{6}$/.test(verificationCode)) {
        newErrors.verificationCode = "El código debe tener 6 dígitos numéricos.";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      try {
        await axios.post(VERIFICAR_CODIGO_URL, {
          email,
          codigo: verificationCode
        });
        setSnackbar({
          open: true,
          message: "Código verificado correctamente.",
          severity: "success"
        });
        setActiveStep(activeStep + 1);
      } catch (error) {
        setErrors({
          verificationCode: error.response?.data?.error || "Error al verificar el código."
        });
      }
    }
    // Paso 2: Validar y actualizar la nueva contraseña
    else if (activeStep === 2) {
      let newErrors = {};
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        newErrors.newPassword =
          "La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, número y carácter especial.";
      }
      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = "Las contraseñas no coinciden.";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setIsSubmitting(true);
      try {
        await axios.post(ACTUALIZAR_CONTRASENA_URL, {
          email,
          password: newPassword,
          confirmPassword: confirmNewPassword
        });
        setSnackbar({
          open: true,
          message: "Contraseña actualizada correctamente.",
          severity: "success"
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (error) {
        setErrors({
          newPassword: error.response?.data?.error || "Error al actualizar la contraseña."
        });
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleResendCode = async () => {
    try {
      // Reenvío del código
      await axios.post(ENVIAR_CODIGO_URL, { email });
      setCounter(60);
      setSnackbar({
        open: true,
        message: "Código reenviado correctamente.",
        severity: "info"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al reenviar el código.",
        severity: "error"
      });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="Correo Electrónico"
              variant="outlined"
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              sx={{ width: "90%", mx: "auto", ...inputStyles }}
            />
            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <Box sx={{ transform: "scale(0.9)", transformOrigin: "center" }}>
                <ReCAPTCHA
                  sitekey="6Lf7gIAqAAAAALfemazpV_kuaVgRHQNgrFi8pQkD"
                  onChange={(value) => {
                    setCaptchaValue(value);
                    if (value) {
                      setErrors((prev) => ({ ...prev, captcha: undefined }));
                    }
                  }}
                />
              </Box>
              {errors.captcha && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.captcha}
                </Typography>
              )}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="Código de Verificación"
              variant="outlined"
              margin="dense"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={Boolean(errors.verificationCode)}
              helperText={errors.verificationCode}
              sx={{ width: "90%", mx: "auto", ...inputStyles }}
            />
            <Typography variant="body2" align="center">
              Se ha enviado un código a su correo electrónico.
            </Typography>
            {counter > 0 ? (
              <Typography variant="caption" align="center" display="block">
                Reenviar código en {counter} segundos.
              </Typography>
            ) : (
              <Button variant="outlined" onClick={handleResendCode}>
                Reenviar Código
              </Button>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              size="small"
              label="Nueva Contraseña"
              variant="outlined"
              margin="dense"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword}
              sx={{ width: "90%", mx: "auto", ...inputStyles }}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowNewPassword} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Sección del medidor de fortaleza */}
            {showPasswordRequirements && (
              <Box
                sx={{
                  width: "90%",
                  mx: "auto",
                  mt: -1,
                  mb: 1,
                  backgroundColor: "rgb(222, 217, 212)",
                  padding: 1,
                  borderRadius: 1,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgb(198, 255, 128)"
                }}
              >
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {passwordStrength.score === 0
                      ? "Muy Débil"
                      : passwordStrength.score === 1
                      ? "Débil"
                      : passwordStrength.score === 2
                      ? "Regular"
                      : passwordStrength.score === 3
                      ? "Fuerte"
                      : "Muy Fuerte"}
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: "10px",
                      backgroundColor: "#ccc",
                      borderRadius: "5px"
                    }}
                  >
                    <Box
                      sx={{
                        height: "10px",
                        borderRadius: "5px",
                        width: `${passwordStrength.score * 16}%`,
                        backgroundColor:
                          passwordStrength.score === 0
                            ? "red"
                            : passwordStrength.score === 1
                            ? "orange"
                            : passwordStrength.score === 2
                            ? "yellow"
                            : passwordStrength.score === 3
                            ? "lightgreen"
                            : "green",
                        transition: "width 0.3s ease-in-out"
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 300, fontSize: "0.8rem" }} color={passwordStrength.length ? "green" : "red"}>
                    • Mínimo 8 caracteres
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 300, fontSize: "0.8rem" }} color={passwordStrength.lowercase ? "green" : "red"}>
                    • Al menos una letra minúscula
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 300, fontSize: "0.8rem" }} color={passwordStrength.uppercase ? "green" : "red"}>
                    • Al menos una letra mayúscula
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 300, fontSize: "0.8rem" }} color={passwordStrength.number ? "green" : "red"}>
                    • Al menos un número
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 300, fontSize: "0.8rem" }} color={passwordStrength.special ? "green" : "red"}>
                    • Al menos un carácter especial
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 300, fontSize: "0.8rem" }} color={passwordStrength.commonPatterns ? "green" : "red"}>
                    • No usar patrones comunes (e.g., "123", "abc")
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField
              size="small"
              label="Confirmar Nueva Contraseña"
              variant="outlined"
              margin="dense"
              type={showConfirmNewPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={Boolean(errors.confirmNewPassword)}
              helperText={errors.confirmNewPassword}
              sx={{ width: "90%", mx: "auto", ...inputStyles }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowConfirmNewPassword} edge="end">
                      {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        );
      default:
        return "Paso desconocido";
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 20, mb: 10 }}>
      <Paper
        elevation={5}
        sx={{
          p: 2,
          borderRadius: 2,
          width: "90%",
          maxWidth: "300px",
          mx: "auto"
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{ color: "#2e7d32" }}
        >
          Recuperar Contraseña
        </Typography>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 3,
            "& .MuiStepIcon-root.Mui-active": { color: "#2e7d32" },
            "& .MuiStepIcon-root.Mui-completed": { color: "#2e7d32" },
            "& .MuiStepLabel-label": { fontSize: "0.7rem" }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form>
          {renderStepContent(activeStep)}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              mt: 3
            }}
          >
            {activeStep > 0 && (
              <Button
                variant="contained"
                onClick={handleBack}
                size="small"
                sx={{
                  backgroundColor: "#9e9e9e",
                  "&:hover": { backgroundColor: "#757575" }
                }}
              >
                Anterior
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              onClick={handleNext}
              size="small"
              disabled={activeStep === steps.length - 1 && isSubmitting}
            >
              {activeStep === steps.length - 1
                ? "Cambiar Contraseña"
                : "Siguiente"}
            </Button>
          </Box>
          {activeStep === 0 && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{" "}
                <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{ color: "#2e7d32" }}
              >
                Inicia sesión
              </Link>
              </Typography>
            </Box>
          )}
        </form>
      </Paper>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 150 }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default RecuperarContrasena;
