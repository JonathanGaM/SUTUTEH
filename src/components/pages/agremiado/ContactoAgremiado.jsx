// src/pages/agremiado/ContactoAgremiado.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Typography,
  Link,
  InputAdornment
} from "@mui/material";
import { Email, Phone, LocationOn, Facebook } from "@mui/icons-material";
import { API_URL } from "../../../config/apiConfig";

const Contacto = () => {
  const [mensaje, setMensaje] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);

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
    setMensaje(e.target.value);
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (mensaje.trim() === "") {
      setError(true);
      setSuccess(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/preguntas/registrado`, {
        method: "POST",
        credentials: "include", // para enviar la cookie authToken
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: mensaje.trim() })
      });

      if (!res.ok) {
        throw new Error("Error al enviar la pregunta");
      }

      const data = await res.json();
      // Agrega el mensaje del usuario al chat
      setChatMessages(prev => [
        ...prev,
        { sender: "user", text: mensaje.trim() },
        { sender: "system", text: "Gracias por tu pregunta. Pronto te responderemos." }
      ]);

      // Limpia y resetea estados
      setMensaje("");
      setError(false);
      setSuccess(true);
      setSubmitAttempted(false);

    } catch (e) {
      console.error(e);
      setError(true);
      setSuccess(false);
    }
  };

  useEffect(() => {
    const fetchMyQAs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/preguntas/usuario`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        // Corregir el orden: mantener el orden cronológico ASC que viene del backend
        // y procesar cada conversación en orden
        const msgs = data.flatMap(item => {
          // Primero la pregunta
          const messages = [{ sender: "user", text: item.question }];
          // Luego todas las respuestas en orden
          item.responses.forEach(response => {
            messages.push({ sender: "system", text: response });
          });
          return messages;
        });
        
        setChatMessages(msgs);
        
      } catch {
        console.error("No pude cargar tus preguntas");
      }
    };

    fetchMyQAs();
    const id = setInterval(fetchMyQAs, 15000);
    return () => clearInterval(id);
  }, []);

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

        {/* Formulario y Chat */}
        <Grid item xs={12} md={7}>
          <Paper
            className="animate__animated animate__fadeInRight"
            elevation={3}
            sx={{ p: 3, mb: 4 }}
          >
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ color: "#2e7d32", fontWeight: "bold" }}
            >
              Escríbenos
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Mensaje"
              name="mensaje"
              value={mensaje}
              onChange={handleChange}
              multiline
              rows={4}
              margin="dense"
              sx={inputStyles}
              error={submitAttempted && mensaje.trim() === ""}
              helperText={
                submitAttempted && mensaje.trim() === ""
                  ? "Campo obligatorio"
                  : ""
              }
            />
            <Box mt={2.5} textAlign="center">
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Enviar
              </Button>
            </Box>
          </Paper>

          {/* Sección de Chat: Preguntas y Respuestas */}
          <Paper
            elevation={3}
            sx={{ p: 3, maxHeight: 300, overflowY: "auto", borderRadius: 2 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#2e7d32", fontWeight: "bold" }}
            >
              Preguntas y Respuestas
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {chatMessages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    backgroundColor:
                      msg.sender === "user" ? "#c8e6c9" : "#eeeeee",
                    color: "black",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "80%"
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 180 }}
        open={error}
        autoHideDuration={3000}
        onClose={() => setError(false)}
      >
        <Alert onClose={() => setError(false)} severity="error" sx={{ width: "100%" }}>
          El mensaje es obligatorio
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 180 }}
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