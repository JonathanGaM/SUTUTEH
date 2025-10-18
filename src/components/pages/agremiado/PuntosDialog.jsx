import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  Table, TableHead, TableRow, TableCell, TableBody,
  Card, CardContent, Chip
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import confetti from "canvas-confetti";

export default function PuntosDialog({ userId }) {
  const [open, setOpen] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/puntos/usuario/${userId}`);
        if (data.success) {
          setPuntos(data.totalPuntos);
          setHistorial(data.historial);
        }
      } catch (error) {
        console.error("Error al cargar puntos:", error);
      }
    };
    fetchData();
  }, [userId]);

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
    lanzarConfeti();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
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
            <EmojiEventsIcon sx={{ color: "#FB8C00", fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#E65100", lineHeight: 1.2 }}>
                Total de Puntos
              </Typography>
              <Typography variant="body1" sx={{ color: "#5D4037" }}>
                <strong>{puntos}</strong> acumulados
              </Typography>
            </Box>
          </Box>

          <Box sx={{ ml: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpen}
              sx={{
                backgroundColor: "#FB8C00",
                "&:hover": { backgroundColor: "#EF6C00" },
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 0.7,
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
              }}
            >
              Ver puntos
            </Button>
          </Box>
        </CardContent>
      </Card>

     {/* Modal del historial */}
<Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: 1,
      color: "#E65100",
      borderBottom: "1px solid #ffe0b2",
      backgroundColor: "#fff8e1",
    }}
  >
    <EmojiEventsIcon /> Historial de Puntos
  </DialogTitle>

  {/* ✅ Contenedor con scroll y encabezado fijo */}
  <DialogContent
    dividers
    sx={{
      maxHeight: "400px",
      overflowY: "auto",
      p: 0,
      scrollbarWidth: "thin",
      "&::-webkit-scrollbar": { width: "6px" },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#FFB74D",
        borderRadius: "4px",
      },
    }}
  >
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#fff3e0",
              "& th": {
                color: "#E65100",
                fontWeight: "bold",
                borderBottom: "2px solid #ffe0b2",
              },
            }}
          >
            <TableCell>Actividad</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Puntos</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {historial.map((item, index) => (
            <TableRow
              key={index}
              hover
              sx={{
                "&:nth-of-type(odd)": { backgroundColor: "#fffdf8" },
                "&:nth-of-type(even)": { backgroundColor: "#fffaf2" },
              }}
            >
              <TableCell sx={{ py: 1 }}>{item.actividad}</TableCell>
              <TableCell sx={{ py: 1 }}>{item.fecha}</TableCell>
              <TableCell align="center" sx={{ py: 1 }}>
                <Chip
                  label={`+${item.puntos}`}
                  size="small"
                  sx={{
                    backgroundColor: "#FFE0B2",
                    color: "#E65100",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    px: 0.5,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </DialogContent>
</Dialog>

    </Box>
  );
}
