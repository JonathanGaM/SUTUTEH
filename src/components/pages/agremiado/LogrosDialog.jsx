import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  Card, CardContent, LinearProgress, Grid, Chip, Divider, IconButton
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CloseIcon from "@mui/icons-material/Close";
import confetti from "canvas-confetti";

export default function LogrosDialog({ userId }) {
  const [open, setOpen] = useState(false);
  const [logros, setLogros] = useState({ obtenidos: [], enProgreso: [] });
  const [selectedLogro, setSelectedLogro] = useState(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  // ========== MAPEO DE EMOJIS (Hardcoded) ==========
  const emojiMap = {
    'Asistente Comprometido': '🎖️',
    'Asistencia Perfecta': '🏆',
    'Votante Principiante': '🗳️',
    'Votante Activo': '⭐',
    'Opinador': '💬',
    'Voz del Sindicato': '📢',
    'Coleccionista Bronce': '🥉',
    'Coleccionista Plata': '🥈',
    'Coleccionista Oro': '🥇',
    'Leyenda del Sindicato': '💎'
  };

  // Función para obtener el emoji correcto
  const getIcono = (logro) => {
    return emojiMap[logro.nombre] || '🏆';
  };

  useEffect(() => {
    fetchLogros();
  }, [userId]);

  const fetchLogros = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/logros/usuario/${userId}`
      );
      if (data.success) {
        setLogros({
          obtenidos: data.obtenidos,
          enProgreso: data.enProgreso
        });
      }
    } catch (error) {
      console.error("Error al cargar logros:", error);
    }
  };

  const lanzarConfeti = () => {
    const duracion = 1500;
    const fin = Date.now() + duracion;
    const frame = () => {
      confetti({
        particleCount: 4,
        startVelocity: 20,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
      if (Date.now() < fin) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleOpen = () => {
    setOpen(true);
    if (logros.obtenidos.length > 0) {
      lanzarConfeti();
    }
  };

  const handleLogroClick = (logro) => {
    setSelectedLogro(logro);
    setOpenDetalle(true);
    if (logro.completado === 1) {
      lanzarConfeti();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Card principal */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
          borderRadius: 3,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          mb: 2,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <WorkspacePremiumIcon sx={{ color: "#388E3C", fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1B5E20", lineHeight: 1.2 }}>
                Mis Logros
              </Typography>
              <Typography variant="body1" sx={{ color: "#2E7D32" }}>
                <strong>{logros.obtenidos.length}</strong> de <strong>{logros.obtenidos.length + logros.enProgreso.length}</strong> desbloqueados
              </Typography>
            </Box>
          </Box>

          <Box sx={{ ml: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpen}
              sx={{
                backgroundColor: "#4CAF50",
                "&:hover": { backgroundColor: "#388E3C" },
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 0.7,
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
              }}
            >
              Ver logros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Modal principal con todos los logros */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            color: "#1B5E20",
            borderBottom: "1px solid #C8E6C9",
            backgroundColor: "#F1F8E9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WorkspacePremiumIcon /> Mis Logros ({logros.obtenidos.length}/{logros.obtenidos.length + logros.enProgreso.length})
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: "500px",
            overflowY: "auto",
            p: 3,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#81C784",
              borderRadius: "4px",
            },
          }}
        >
          {/* Logros Obtenidos */}
          {logros.obtenidos.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: "#4CAF50", display: "flex", alignItems: "center", gap: 1 }}>
                ✅ Logros Obtenidos ({logros.obtenidos.length})
              </Typography>
              <Grid container spacing={2}>
                {logros.obtenidos.map((logro) => (
                  <Grid item xs={6} sm={4} md={3} key={logro.id}>
                    <Card
                      onClick={() => handleLogroClick(logro)}
                      sx={{
                        cursor: "pointer",
                        background: "linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)",
                        border: "2px solid #FFD54F",
                        boxShadow: "0 4px 8px rgba(255, 193, 7, 0.3)",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.05)" },
                        textAlign: "center"
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h2" sx={{ mb: 1 }}>
                          {getIcono(logro)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#F57F17", fontSize: "0.85rem" }}>
                          {logro.nombre}
                        </Typography>
                        <Chip
                          label="Completado"
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor: "#4CAF50",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.7rem"
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Logros En Progreso */}
          {logros.enProgreso.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: "#FF9800", display: "flex", alignItems: "center", gap: 1 }}>
                🔄 En Progreso ({logros.enProgreso.length})
              </Typography>
              <Grid container spacing={2}>
                {logros.enProgreso.map((logro) => (
                  <Grid item xs={12} sm={6} key={logro.id}>
                    <Card
                      onClick={() => handleLogroClick(logro)}
                      sx={{
                        cursor: "pointer",
                        background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                        border: "1px solid #FFB74D",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                          <Typography variant="h3">{getIcono(logro)}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#E65100" }}>
                              {logro.nombre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#5D4037" }}>
                              {logro.descripcion}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Barra de progreso */}
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: "#E65100", fontWeight: "bold" }}>
                              {logro.progreso}/{logro.meta}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#FB8C00", fontWeight: "bold" }}>
                              {logro.porcentaje}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(logro.porcentaje, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#FFE0B2",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: "#FB8C00"
                              }
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Sin logros */}
          {logros.obtenidos.length === 0 && logros.enProgreso.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>🎯</Typography>
              <Typography variant="body1" color="text.secondary">
                Comienza a participar para desbloquear logros
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle de Logro Individual */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="xs" fullWidth>
        {selectedLogro && (
          <>
            <DialogTitle
              sx={{
                backgroundColor: selectedLogro.completado ? "#FFFDE7" : "#FFF3E0",
                borderBottom: "2px solid #FFD54F",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h3">{getIcono(selectedLogro)}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#E65100" }}>
                  {selectedLogro.nombre}
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenDetalle(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, color: "#5D4037" }}>
                {selectedLogro.descripcion}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tipo:
                </Typography>
                <Chip
                  label={selectedLogro.tipo}
                  size="small"
                  sx={{ backgroundColor: "#E0F2F1", color: "#00695C", fontWeight: "bold" }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progreso:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedLogro.progreso}/{selectedLogro.meta}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Completado:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedLogro.porcentaje}%
                </Typography>
              </Box>

              {selectedLogro.completado === 1 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Obtenido:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#4CAF50" }}>
                    {selectedLogro.fecha_obtencion}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(selectedLogro.porcentaje, 100)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#FFE0B2",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: selectedLogro.completado ? "#4CAF50" : "#FB8C00"
                    }
                  }}
                />
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}