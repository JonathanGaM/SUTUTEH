// src/pages/agremiado/RankingDialog.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { API_URL } from "../../../config/apiConfig";

function RankingDialog({ userId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rankingData, setRankingData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);

  // Sistema de niveles basado en POSICIÓN en el ranking (NO en puntos)
  const getNivelPorPosicion = (posicion) => {
    if (posicion === 1) {
      return { nombre: "Oro", color: "#FFD700", emoji: "🥇" };
    } else if (posicion === 2) {
      return { nombre: "Plata", color: "#C0C0C0", emoji: "🥈" };
    } else if (posicion === 3) {
      return { nombre: "Bronce", color: "#CD7F32", emoji: "🥉" };
    } else {
      return { nombre: "Participante", color: "#9E9E9E", emoji: "👤" };
    }
  };

  useEffect(() => {
    if (open) {
      cargarRanking();
    }
  }, [open]);

  const cargarRanking = async () => {
    setLoading(true);
    try {
      const [posicionRes, rankingRes] = await Promise.all([
        axios.get(`${API_URL}/api/ranking/posicion/${userId}`),
        axios.get(`${API_URL}/api/ranking/top10`),
      ]);

      setUserPosition(posicionRes.data);
      setRankingData(rankingRes.data);
    } catch (error) {
      console.error("Error al cargar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      {/* Card con botón "Ver posición" */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
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
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <EmojiEventsIcon sx={{ color: "#2196F3", fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1565C0", lineHeight: 1.2 }}>
                Mi Ranking
              </Typography>
              <Typography variant="body2" sx={{ color: "#0D47A1" }}>
                Ver mi posición y clasificación
              </Typography>
            </Box>
          </Box>

          <Box sx={{ ml: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpen}
              sx={{
                backgroundColor: "#2196F3",
                "&:hover": { backgroundColor: "#1976D2" },
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 0.7,
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
              }}
            >
              Ver posición
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Diálogo del Ranking */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "85vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 20,
            color: "#2196F3",
            pb: 1,
            pt: 2,
          }}
        >
          🏆 Ranking de Agremiados
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Posición del usuario - SIMPLIFICADA */}
              {userPosition && (
                <Box
                  sx={{
                    backgroundColor: "#E3F2FD",
                    borderRadius: 2,
                    p: 1.5,
                    mb: 2,
                    textAlign: "center",
                    border: "2px solid #2196F3",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", fontSize: 10 }}>
                    TU POSICIÓN
                  </Typography>
                  
                  <Typography variant="h4" fontWeight="bold" color="#2196F3" sx={{ my: 0.3 }}>
                    #{userPosition.posicion}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    de {userPosition.totalAgremiados} agremiados
                  </Typography>

                  <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 0.6, flexWrap: "wrap" }}>
                    {(() => {
                      const nivel = getNivelPorPosicion(userPosition.posicion);
                      return (
                        <>
                          <Chip
                            label={nivel.emoji}
                            size="small"
                            sx={{
                              backgroundColor: nivel.color,
                              color: "white",
                              fontWeight: "bold",
                              fontSize: 16,
                              height: 28,
                              px: 1,
                            }}
                          />
                          <Chip
                            label={`${userPosition.puntos_totales} puntos`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: "bold", fontSize: 11, height: 28 }}
                          />
                        </>
                      );
                    })()}
                  </Box>
                </Box>
              )}

              {/* Top agremiados con SCROLL */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, fontSize: 14 }}>
                🏅 Clasificación General
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {/* Lista con scroll */}
              <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 0.5 }}>
                <List disablePadding>
                  {rankingData?.map((agremiado, index) => {
                    const posicion = index + 1; // Posición real en el ranking
                    const nivel = getNivelPorPosicion(posicion);

                    return (
                      <React.Fragment key={agremiado.usuario_id}>
                        <ListItem
                          sx={{
                            backgroundColor: posicion <= 3 ? `${nivel.color}15` : "transparent",
                            borderRadius: 1.5,
                            mb: 0.8,
                            py: 1,
                            px: 1.5,
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 45 }}>
                            <Avatar
                              sx={{
                                backgroundColor: posicion <= 3 ? nivel.color : "#757575",
                                fontWeight: "bold",
                                fontSize: 16,
                                width: 36,
                                height: 36,
                              }}
                            >
                              {nivel.emoji}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography fontWeight="bold" sx={{ fontSize: 14 }}>
                                {agremiado.nombre_completo}
                              </Typography>
                            }
                            secondary={
                              <Chip
                                label={`${agremiado.puntos_totales} puntos`}
                                size="small"
                                color="primary"
                                sx={{ fontSize: 9, height: 18, mt: 0.3 }}
                              />
                            }
                          />
                        </ListItem>
                        {index < rankingData.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={handleClose} variant="contained" color="primary" size="small">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RankingDialog;