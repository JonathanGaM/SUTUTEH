// src/pages/Reuniones.jsx
import React, { useState, useRef, useMemo,useEffect } from "react";
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

const columns = [
  { field: "title", headerName: "Título", flex: 1, minWidth: 150 },
  { field: "description", headerName: "Descripción", flex: 2, minWidth: 250 },
  
  {
    field: "estado",
    headerName: "Estado",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      // params.value debe ser "Asistió" o "No asistió"
      const label = params.value || "No asistió";
      const color = label === "Asistió" ? "primary" : "warning";
      return <Chip label={label} size="small" color={color} sx={{ color: "white" }} />;
    }
  }
];

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

  axios
     .get(`${API_URL}/api/reuniones/usuario/asistencia`, { withCredentials: true })
     .then(({ data }) => {
       // Filtrar solo "En Curso" o "Terminada" y generar el campo "estado"
       const filtered = data
         .filter((r) => r.status === "En Curso" || r.status === "Terminada")
         .map((r) => ({
           ...r,
           estado: r.asistio === 1 ? "Asistió" : "No asistió"
         }));
       setRows(filtered);
     })
     .catch(console.error);
  }, []);

  // Cuando `openScanner` pasa a true, lanzamos el init un poco después
  useEffect(() => {
    let html5QrCode;
    if (openScanner) {
      // esperamos un tick para que el <div id="qr-reader"> exista
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
                .then(() => {
                  showSnackbar("Asistencia registrada", "success");
                 return axios.get(`${API_URL}/api/reuniones/usuario/asistencia`, { withCredentials: true });

                })
                 .then(({ data }) => {
                  const updated = data
                    .filter((r) => r.status === "En Curso" || r.status === "Terminada")
                    .map((r) => ({
                      ...r,
                      estado: r.asistio === 1 ? "Asistió" : "No asistió"
                    }));
                  setRows(updated);
                })
                .catch(() => showSnackbar("Falló al registrar asistencia", "error"));

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


  // Eventos para el calendario (mapeamos desde `rows`)
 

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

// Devuelve estilos dinámicos según el status del evento
const eventStyleGetter = (event) => {
  let backgroundColor = "#1976d2"; // azul para "Programada"
  if (event.status === "En Curso") backgroundColor = "#4caf50";   // verde
  if (event.status === "Terminada") backgroundColor = "#f44336"; // rojo

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
    // Para el estado "estado", si ya estaba en rows, mantenlo; si no, usa reunion.status
    const tuvoAsistencia = rows.find((rr) => rr.id === reunión.id);
    const estado = tuvoAsistencia
      ? tuvoAsistencia.estado
      : reunión.status === "En Curso"
      ? "En Curso"
      : reunión.status === "Terminada"
      ? "Terminada"
      : "Programada";

    setCurrent({ ...reunión, estado });
    setViewOpen(true);
  }
  };
  // Diálogo de detalle (reutilizado)
  const [viewOpen, setViewOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const closeView = () => setViewOpen(false);
    // Helper: formatear fecha "YYYY-MM-DD" ➔ "31 de mayo de 2025"
  const formatFecha = (raw) => {
    if (!raw) return "";
    const d = raw instanceof Date ? raw : new Date(raw);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper: formatear hora "HH:MM:SS" ➔ "HH:MM hr"
  const formatHora = (raw) => {
    if (!raw) return "";
    // Si es Date, lo pasamos a cadena "HH:MM"
    if (raw instanceof Date) {
      return (
        raw.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " hr"
      );
    }
    // Si viene como string "HH:MM:SS"
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

         {/* Historial de Reuniones (con <Table> manual) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Historial de Reuniones
        </Typography>
        <Paper sx={{ width: "100%"  }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgb(183, 205, 239)" }}>
                  <TableCell>Título</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Estado</TableCell>
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
                          label={r.estado}
                          size="small"
                          color={r.estado === "Asistió" ? "primary" : "warning"}
                          sx={{ color: "white" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación manual (igual que en AdminReuniones) */}
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
{/* Diálogo de detalle de reunión (clic sobre evento) */}
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
          <Typography variant="body2">Estado: {current?.estado}</Typography>
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
      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
          
        </Alert>
      </Snackbar>
    </Container>
  );
}