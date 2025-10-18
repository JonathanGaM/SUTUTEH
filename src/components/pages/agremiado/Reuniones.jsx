// src/pages/Reuniones.jsx - MODIFICADO
import React, { useState, useRef, useMemo, useEffect } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import { API_URL } from "../../../config/apiConfig";

import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import confetti from "canvas-confetti";


// Función para obtener el color del chip según el estado de asistencia
const getAsistenciaColor = (estado) => {
  switch (estado) {
    case 'asistencia_completa':
      return 'success';
    case 'retardo':
      return 'warning';
    case 'falta_justificada':
      return 'info';
    case 'falta_no_justificada':
      return 'error';
    default:
      return 'default';
  }
};

// Función para obtener el label amigable del estado de asistencia
const getAsistenciaLabel = (estado) => {
  switch (estado) {
    case 'asistencia_completa':
      return 'Asistencia Completa';
    case 'retardo':
      return 'Retardo';
    case 'falta_justificada':
      return 'Falta Justificada';
    case 'falta_no_justificada':
      return 'Falta No Justificada';
    default:
      return 'Sin Registrar';
  }
};

export default function Reuniones() {
  const scannerId = "qr-reader";
  const [rows, setRows] = useState([]);
  const [openScanner, setOpenScanner] = useState(false);

  // Calendario
  const localizer = momentLocalizer(moment);
  moment.locale("es");
  const [calView, setCalView] = useState(Views.MONTH);
  const [calDate, setCalDate] = useState(new Date());
  const [todasLasReuniones, setTodasLasReuniones] = useState([]);

  // Paginación para la tabla manual
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  // ✅ Estados para el diálogo de asistencia
const [openAsistenciaDialog, setOpenAsistenciaDialog] = useState(false);
const [asistenciaInfo, setAsistenciaInfo] = useState({ estado: "", puntaje: 0 });

// 🎉 Confeti al abrir el modal
useEffect(() => {
  if (openAsistenciaDialog) {
    const duracion = 1500;
    const fin = Date.now() + duracion;

    const lanzar = () => {
      confetti({
        particleCount: 8,
        startVelocity: 25,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#4CAF50", "#81C784", "#C8E6C9", "#A5D6A7"],
      });
      if (Date.now() < fin) requestAnimationFrame(lanzar);
    };

    lanzar();
  }
}, [openAsistenciaDialog]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const messagesEs = {
    allDay: "Todo el día",
    previous: "Atrás",
    next: "Próximo",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "No hay eventos en este rango.",
    showMore: (total) => `+ Ver más (${total})`,
  };

  // Cargar reuniones al montar
  useEffect(() => {
    // 1) Cargar TODAS las reuniones (para el calendario)
    axios
      .get(`${API_URL}/api/reuniones`)
      .then(({ data }) => {
        setTodasLasReuniones(data);
      })
      .catch((err) =>
        console.error("Error cargando todas las reuniones:", err)
      );

    // 2) Cargar reuniones con asistencia del usuario
    axios
      .get(`${API_URL}/api/reuniones/usuario/asistencia`, { withCredentials: true })
      .then(({ data }) => {
        // Filtrar solo reuniones que no están en estado "Programada"
        const filtered = data
          .filter((r) => r.status !== "Programada")
          .map((r) => ({
            ...r,
            // Usar el estado de asistencia del backend
            estado: r.estado_asistencia || 'falta_no_justificada'
          }));
        setRows(filtered);
      })
      .catch(console.error);
  }, []);

  // Cuando `openScanner` pasa a true, lanzamos el init un poco después
  useEffect(() => {
    let html5QrCode;
    if (openScanner) {
      const timer = setTimeout(() => {
        html5QrCode = new Html5Qrcode(scannerId);
        html5QrCode
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              // decodedText === ID de la reunión
              axios
                .post(
                  `${API_URL}/api/reuniones/${decodedText}/asistencia`,
                  {},
                  { withCredentials: true }
                )
                .then((response) => {
                  // El backend ahora devuelve información sobre el estado registrado
                  const { estado, puntaje, estadoReunion } = response.data;
                  setAsistenciaInfo({ estado, puntaje });
setOpenAsistenciaDialog(true);

                  
                  // Recargar las reuniones con asistencia actualizada
                  return axios.get(`${API_URL}/api/reuniones/usuario/asistencia`, { withCredentials: true });
                })
                .then(({ data }) => {
                  const updated = data
                    .filter((r) => r.status !== "Programada")
                    .map((r) => ({
                      ...r,
                      estado: r.estado_asistencia || 'falta_no_justificada'
                    }));
                  setRows(updated);
                })
                .catch((error) => {
                  console.error('Error:', error);
                  if (error.response?.data?.error) {
                    showSnackbar(error.response.data.error, "error");
                  } else {
                    showSnackbar("Falló al registrar asistencia", "error");
                  }
                });

              setOpenScanner(false);
            },
            (err) => {
              console.warn("Error leyendo QR:", err);
            }
          )
          .catch((err) => {
            console.error("Error iniciando escáner:", err);
            showSnackbar("Error al iniciar escáner", "error");
            setOpenScanner(false);
          });
      }, 200);

      return () => {
        clearTimeout(timer);
        if (html5QrCode) html5QrCode.stop().catch(() => {});
      };
    }
  }, [openScanner]);

  const handleOpenScanner = () => setOpenScanner(true);
  const handleCloseScanner = () => setOpenScanner(false);

  const calEvents = useMemo(() => {
    return todasLasReuniones.map((r) => {
      const start = moment(`${r.date} ${r.time}`, "YYYY-MM-DD HH:mm:ss").toDate();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return {
        id: r.id,
        title: r.title,
        start,
        end,
        status: r.status,
      };
    });
  }, [todasLasReuniones]);

  // Estilos para el calendario basados en los nuevos estados
  const eventStyleGetter = (event) => {
    let backgroundColor = "#1976d2"; // azul para "Programada"
    
    switch (event.status) {
      case 'Programada':
        backgroundColor = "#1976d2"; // azul
        break;
      case 'Registro_Abierto':
        backgroundColor = "#4caf50"; // verde
        break;
      case 'Retardos_Permitidos':
        backgroundColor = "#ff9800"; // naranja
        break;
      case 'Falta_No_Justificada':
        backgroundColor = "#f44336"; // rojo
        break;
      case 'Terminada':
        backgroundColor = "#9e9e9e"; // gris
        break;
      default:
        backgroundColor = "#1976d2";
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
      },
    };
  };

  // Al hacer clic en un evento, abrimos el diálogo de detalle
  const handleCalSelect = (eventoCalendario) => {
    const reunión = todasLasReuniones.find((r) => r.id === eventoCalendario.id);
    if (reunión) {
      // Buscar el estado de asistencia del usuario para esta reunión
      const tuvoAsistencia = rows.find((rr) => rr.id === reunión.id);
      const estado = tuvoAsistencia?.estado || 'Sin registrar';

      setCurrent({ ...reunión, estado });
      setViewOpen(true);
    }
  };

  // Diálogo de detalle
  const [viewOpen, setViewOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const closeView = () => setViewOpen(false);

  // Helper: formatear fecha
  const formatFecha = (raw) => {
    if (!raw) return "";
    const d = raw instanceof Date ? raw : new Date(raw);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper: formatear hora
  const formatHora = (raw) => {
    if (!raw) return "";
    if (raw instanceof Date) {
      return (
        raw.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " hr"
      );
    }
    return `${String(raw).slice(0, 5)} hr`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 15, mb: 4 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Reuniones
        </Typography>
        <Box
          sx={{
            height: 2,
            width: 120,
            bgcolor: "green",
            mx: "auto",
            mt: 1,
            mb: 2
          }}
        />
      </Box>

      {/* Calendario */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Calendar
          localizer={localizer}
          events={calEvents}
          startAccessor="start"
          endAccessor="end"
          view={calView}
          onView={(newView) => setCalView(newView)}
          date={calDate}
          onNavigate={(newDate) => setCalDate(newDate)}
          views={{ month: true, week: true, day: true, agenda: true }}
          toolbar={true}
          messages={messagesEs}
          style={{ height: 400 }} 
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleCalSelect}
        />
      </Paper>

      {/* Botón Escáner QR */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<QrCodeScannerIcon />}
          onClick={handleOpenScanner}
          sx={{ fontSize: "0.8rem" }}
        >
          Escanear QR
        </Button>
      </Box>

      {/* Historial de Reuniones */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Historial de Reuniones
        </Typography>
        <Paper sx={{ width: "100%" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgb(183, 205, 239)" }}>
                  <TableCell>Título</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Estado Asistencia</TableCell>
                  <TableCell>Puntaje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell>{formatFecha(r.date)}</TableCell>
                      <TableCell>{formatHora(r.time)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getAsistenciaLabel(r.estado)}
                          size="small"
                          color={getAsistenciaColor(r.estado)}
                          sx={{ color: "white" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${r.puntaje || 0} pts`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Box>

      {/* Modal Escáner QR */}
      <Dialog
        open={openScanner}
        onClose={handleCloseScanner}
        PaperProps={{
          sx: {
            position: "fixed",
            right: 0,
            top: "80px",
            m: 0,
            width: { xs: "100%", sm: "350px" },
            height: "calc(100% - 80px)",
            backgroundColor: "gray"
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "darkgray"
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "0.8rem", color: "white" }}>
            Escáner QR
          </Typography>
          <IconButton onClick={handleCloseScanner} sx={{ color: "white" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0, backgroundColor: "gray" }}>
          <div id={scannerId} style={{ width: "100%" }} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle de reunión */}
      <Dialog open={viewOpen} onClose={closeView} fullWidth>
        <DialogTitle>Detalle de Reunión</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Título: {current?.title}</Typography>
          <Typography variant="body2">
            Fecha:{" "}
            {current?.date &&
              new Date(current.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
          </Typography>
          <Typography variant="body2">
            Hora: {current?.time && `${current.time.slice(0, 5)} hr`}
          </Typography>
          <Typography variant="body2">
            Estado: {current?.estado && (
              <Chip 
                label={getAsistenciaLabel(current.estado)} 
                size="small" 
                color={getAsistenciaColor(current.estado)}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {current?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView} size="small">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* ✅ Diálogo de asistencia registrada con confeti */}
<Dialog
  open={openAsistenciaDialog}
  onClose={() => setOpenAsistenciaDialog(false)}
  fullWidth
  maxWidth="xs"
  PaperProps={{
    sx: {
      textAlign: "center",
      borderRadius: 3,
      p: 2,
      position: "relative",
      overflow: "hidden"
    },
  }}
>
  <DialogTitle sx={{ fontWeight: "bold", color: "#2E7D32" }}>
    ✅ ¡Asistencia registrada!
  </DialogTitle>

  <DialogContent>
    <Typography variant="h6" sx={{ mb: 1, color: "#388E3C" }}>
      {getAsistenciaLabel(asistenciaInfo.estado)}
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Has ganado <strong>{asistenciaInfo.puntaje}</strong> puntos 🎯
    </Typography>
    <Typography variant="body2" color="text.secondary">
      ¡Gracias por participar en esta reunión!
    </Typography>
  </DialogContent>

  <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
    <Button
      variant="contained"
      onClick={() => setOpenAsistenciaDialog(false)}
      sx={{
        backgroundColor: "#2E7D32",
        "&:hover": { backgroundColor: "#1B5E20" },
        px: 4,
        borderRadius: 2,
      }}
    >
      Aceptar
    </Button>
  </DialogActions>
</Dialog>


      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}