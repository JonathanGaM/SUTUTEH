// src/pages/public/Contacto.jsx

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Typography,
  InputAdornment,
  Link
} from "@mui/material";
import { Email, Phone, LocationOn, Facebook } from "@mui/icons-material";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
    email: "",
    mensaje: ""
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estilos para efecto en foco (verde claro)
  const inputStyles = {
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#81c784"
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#81c784"
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  setSubmitAttempted(true);

  // Validación local
  if (Object.values(formData).some((f) => f.trim() === "")) {
    setError(true);
    setSuccess(false);
    return;
  }
  setError(false);

  const payload = {
    nombre:          formData.nombre.trim(),
    apellidoPaterno: formData.apellidoPaterno.trim(),
    apellidoMaterno: formData.apellidoMaterno.trim(),
    telefono:        formData.telefono.trim(),
    email:           formData.email.trim(),
    mensaje:         formData.mensaje.trim(),
  };

  try {
    const res = await fetch("http://localhost:3001/api/preguntas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al enviar la pregunta");
    }
  // Simulación de éxito inmediato
  console.log("Enviando datos...", payload);

  // Simulamos un retraso artificial
  await new Promise(res => setTimeout(res, 500));
    // Éxito: limpiamos sólo 'mensaje', reseteamos validación y disparamos alerta
    setFormData(prev => ({ ...prev, mensaje: "" }));
    setSubmitAttempted(false);
    setError(false);
    setSuccess(true);
  } catch (e) {
    console.error(e);
    setError(true);
    setSuccess(false);
  }
};


  return (
    <Box
      className="animate__animated animate__fadeIn animate__faster"
      sx={{ maxWidth: 900, mx: "auto", p: 4, mt: 4, mb: 8 }}
    >
      <Grid container spacing={4} justifyContent="space-between">
        {/* Información de Contacto alineada a la izquierda */}
        <Grid item xs={12} md={5}>
          <Paper
            className="animate__animated animate__fadeInLeft"
            elevation={3}
            sx={{
              p: 3,
              textAlign: "left",
              borderLeft: "5px solid #2e7d32",
              backgroundColor: "#f9f9f9"
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#2e7d32", fontWeight: "bold" }}
            >
              Contacto
            </Typography>
            <Box display="flex" alignItems="center" mt={2}>
              <LocationOn sx={{ mr: 1, color: "#2e7d32" }} />
              <Typography variant="body2">
                Carr. Huejutla - Chalahuiyapa S/N, Col. Tepoxteco, Huejutla de Reyes, Hgo.
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mt={2}>
              <Phone sx={{ mr: 1, color: "#2e7d32" }} />
              <Typography variant="body2">+52 123 456 7890</Typography>
            </Box>
            <Box display="flex" alignItems="center" mt={2}>
              <Email sx={{ mr: 1, color: "#2e7d32" }} />
              <Typography variant="body2">contacto@sututeh.com</Typography>
            </Box>
            <Box display="flex" alignItems="center" mt={2}>
              <Facebook sx={{ mr: 1, color: "#2e7d32" }} />
              <Typography variant="body2">
                <Link
                  href="https://www.facebook.com/share/1BWL6aQsXe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#2e7d32",
                    textDecoration: "none",
                    fontWeight: "medium"
                  }}
                >
                  Facebook
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Formulario de Contacto alineado a la derecha */}
        <Grid item xs={12} md={7}>
          <Paper
            className="animate__animated animate__fadeInRight"
            elevation={3}
            sx={{ p: 3 }}
          >
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ color: "#2e7d32", fontWeight: "bold" }}
            >
              Escríbenos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre"
                  name="nombre"
                  onChange={handleChange}
                  margin="dense"
                  sx={inputStyles}
                  error={submitAttempted && !formData.nombre.trim()}
                  helperText={
                    submitAttempted && !formData.nombre.trim()
                      ? "Campo obligatorio"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Paterno"
                  name="apellidoPaterno"
                  onChange={handleChange}
                  margin="dense"
                  sx={inputStyles}
                  error={submitAttempted && !formData.apellidoPaterno.trim()}
                  helperText={
                    submitAttempted && !formData.apellidoPaterno.trim()
                      ? "Campo obligatorio"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Materno"
                  name="apellidoMaterno"
                  onChange={handleChange}
                  margin="dense"
                  sx={inputStyles}
                  error={submitAttempted && !formData.apellidoMaterno.trim()}
                  helperText={
                    submitAttempted && !formData.apellidoMaterno.trim()
                      ? "Campo obligatorio"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono"
                  name="telefono"
                  onChange={handleChange}
                  margin="dense"
                  sx={inputStyles}
                  error={submitAttempted && !formData.telefono.trim()}
                  helperText={
                    submitAttempted && !formData.telefono.trim()
                      ? "Campo obligatorio"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: "#2e7d32" }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  name="email"
                  onChange={handleChange}
                  margin="dense"
                  sx={inputStyles}
                  error={submitAttempted && !formData.email.trim()}
                  helperText={
                    submitAttempted && !formData.email.trim()
                      ? "Campo obligatorio"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#2e7d32" }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  margin="dense"
                  sx={inputStyles}
                  error={submitAttempted && !formData.mensaje.trim()}
                  helperText={
                    submitAttempted && !formData.mensaje.trim()
                      ? "Campo obligatorio"
                      : ""
                  }
                />
              </Grid>
            </Grid>
            <Box mt={2.5} textAlign="center">
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Enviar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={theme => ({
   // Offset hacía abajo solo si tienes un AppBar fijo de, digamos, 64px
   top: {
     xs: theme.spacing(10),   // móvil: 80px
     md: theme.spacing(13),    // escritorio: 64px
   },
   right: theme.spacing(2),    // siempre con un pequeño margen del borde
   zIndex: theme.zIndex.drawer + 1, // por encima de cualquier Drawer/AppBar
 })}
        open={error}
        autoHideDuration={3000}
        onClose={() => setError(false)}
      >
        <Alert onClose={() => setError(false)} severity="error" sx={{ width: "100%" }}>
          Todos los campos son obligatorios
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={theme => ({
   // Offset hacía abajo solo si tienes un AppBar fijo de, digamos, 64px
   top: {
     xs: theme.spacing(10),   // móvil: 80px
     md: theme.spacing(13),    // escritorio: 64px
   },
   right: theme.spacing(2),    // siempre con un pequeño margen del borde
   zIndex: theme.zIndex.drawer + 1, // por encima de cualquier Drawer/AppBar
 })}
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: "100%" }}>
          Mensaje enviado con éxito
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contacto;


