//admin_reuniones.jsx - MODIFICADO CON BOTÓN PREDECIR ASISTENCIA
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Container,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PsychologyIcon from "@mui/icons-material/Psychology";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { API_URL } from "../../../../config/apiConfig";

// Función para obtener el color del chip según el estado
const getStatusColor = (status) => {
  switch (status) {
    case 'Programada':
      return 'info';
    case 'Registro_Abierto':
      return 'success';
    case 'Retardos_Permitidos':
      return 'warning';
    case 'Falta_No_Justificada':
      return 'error';
    case 'Terminada':
      return 'default';
    default:
      return 'default';
  }
};

// Función para obtener el label amigable del estado
const getStatusLabel = (status) => {
  switch (status) {
    case 'Programada':
      return 'Programada';
    case 'Registro_Abierto':
      return 'Registro Abierto';
    case 'Retardos_Permitidos':
      return 'Retardos Permitidos';
    case 'Falta_No_Justificada':
      return 'Registro Cerrado';
    case 'Terminada':
      return 'Terminada';
    default:
      return status;
  }
};

export default function AdminReuniones() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();
  const localizer = momentLocalizer(moment);
  moment.locale("es");
  const [calView, setCalView] = useState(Views.MONTH);
  const [calDate, setCalDate] = useState(new Date());

  const handleCalSelect = (eventoCalendario) => {
    const reunion = meetings.find((m) => m.id === eventoCalendario.id);
    if (reunion) {
      openView(reunion);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/reuniones`)
      .then((resp) => setMeetings(resp.data))
      .catch((err) => console.error("Error cargando reuniones", err));
  }, []);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = search.toLowerCase();
    return meetings
      .filter((m) => {
        const title = (m.title || "").toLowerCase();
        const loc = (m.location || "").toLowerCase();
        return title.includes(q) || loc.includes(q);
      })
      .filter((m) => {
        if (filterStatus === "Hoy") return m.date === today;
        if (filterStatus === "Todos") return true;
        return m.status === filterStatus;
      });
  }, [meetings, search, filterStatus]);

  // Paginación
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Formulario nuevo/editar
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    type: "Ordinaria",
  });

  // Ver detalles
  const [viewOpen, setViewOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // QR dialog
  const [qrOpen, setQrOpen] = useState(false);
  const qrRef = useRef();

  // Función para manejar la predicción de asistencia
  const handlePredecirAsistencia = () => {
    showSnackbar("Redirigiendo a módulo de predicciones...", "info");
    // Navegar al módulo de predicciones
    navigate('/admin_predicciones');
  };

  const openForm = (meeting = null) => {
    if (meeting) {
      setEditingId(meeting.id);
      setFormData({ ...meeting });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        type: "Ordinaria",
      });
    }
    setFormOpen(true);
  };
  
  const closeForm = () => setFormOpen(false);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      const resp = await axios.post(
        `${API_URL}/api/reuniones`,
        payload
      );
      
      const nuevaReunion = resp.data;
      setMeetings((prev) => [nuevaReunion, ...prev]);
      showSnackbar("Reunión creada correctamente");
      closeForm();
      setPage(0);
    } catch (err) {
      console.error(err);
      showSnackbar("Error al crear reunión", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = { ...formData };
      const resp = await axios.put(
        `${API_URL}/api/reuniones/${editingId}`,
        payload
      );
      setMeetings((prev) =>
        prev.map((m) => (m.id === editingId ? resp.data : m))
      );
      showSnackbar("Reunión actualizada correctamente");
      closeForm();
      setPage(0);
    } catch (err) {
      console.error(err);
      showSnackbar("Error al actualizar reunión", "error");
    }
  };

  const openView = (m) => {
    setCurrent(m);
    setViewOpen(true);
  };
  
  const closeView = () => setViewOpen(false);
  const closeQr = () => setQrOpen(false);

  const downloadPdf = async () => {
    if (!current) return showSnackbar("No hay reunión seleccionada", "error");
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return showSnackbar("SVG no disponible", "error");

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "-10000px";
    wrapper.style.left = "-10000px";
    wrapper.appendChild(svgEl.cloneNode(true));
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      backgroundColor: null,
      scale: 3,
    });
    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
    const pdfW = doc.internal.pageSize.getWidth();

    const targetWidth = pdfW * 0.5;
    const targetHeight = (canvas.height * targetWidth) / canvas.width;
    const x = (pdfW - targetWidth) / 2;
    const y = (doc.internal.pageSize.getHeight() - targetHeight) / 2;

    doc.addImage(imgData, "PNG", x, y, targetWidth, targetHeight);
    doc.save(`qr_reunion_${current.id}.pdf`);
  };

  const messagesEs = {
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    allDay: "Todo el día",
    week: "Semana",
    work_week: "Semana laboral",
    day: "Día",
    month: "Mes",
    previous: "Anterior",
    next: "Siguiente",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    today: "Hoy",
    agenda: "Agenda",
    noEventsInRange: "No hay eventos en este período",
    showMore: (total) => `+${total} más`
  };

  const openQr = async (meeting) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/reuniones/${meeting.id}`
      );
      setCurrent(data);
      setQrOpen(true);
    } catch (err) {
      console.error("No pude cargar los datos de la reunión:", err);
      showSnackbar("Error al cargar el QR", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/reuniones/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      showSnackbar("Reunión eliminada correctamente", "info");
    } catch (err) {
      console.error("Error al eliminar reunión:", err);
      showSnackbar("No se pudo eliminar la reunión", "error");
    }
  };

  const calEvents = useMemo(() => {
    return meetings.map((m) => {
      const start = moment(`${m.date} ${m.time}`, "YYYY-MM-DD HH:mm:ss").toDate();
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      return {
        id: m.id,
        title: m.title,
        start,
        end,
        status: m.status, 
      };
    });
  }, [meetings]);

  // Función actualizada para manejar los nuevos estados
  const eventStyleGetter = (event) => {
    let backgroundColor = "#1976d2"; // azul por defecto
    
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          mb: 2,
          flexWrap: "wrap",
          transition: "box-shadow 0.3s",
          "&:hover": { boxShadow: 8 },
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Calendar
            localizer={localizer}
            events={calEvents}
            startAccessor="start"
            endAccessor="end"
            view={calView}
            onView={(newView) => setCalView(newView)}
            date={calDate}
            onNavigate={(newDate) => setCalDate(newDate)}
            views={{
              month: true,
              week: true,
              day: true,
              agenda: true
            }}
            toolbar={true}
            messages={messagesEs}
            style={{ height: 500 }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleCalSelect}
          />
        </Box>
      </Paper>

      {/* Barra de acciones */}
      <Paper
        sx={{
          p: 1.5,
          mb: 1.5,
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          transition: "box-shadow 0.3s",
          "&:hover": { boxShadow: 8 },
        }}
      >
        <TextField
          label="Buscar reunión"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small">
          <InputLabel>Filtrar</InputLabel>
          <Select
            value={filterStatus}
            label="Filtrar"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Programada">Programadas</MenuItem>
            <MenuItem value="Registro_Abierto">Registro Abierto</MenuItem>
            <MenuItem value="Retardos_Permitidos">Retardos Permitidos</MenuItem>
            <MenuItem value="Falta_No_Justificada">Registro Cerrado</MenuItem>
            <MenuItem value="Terminada">Terminadas</MenuItem>
            <MenuItem value="Hoy">Hoy</MenuItem>
          </Select>
        </FormControl>
         {/*  BOTÓN - Estadísticas Anuales */}
  <Button 
    variant="outlined" 
    color="secondary"
    onClick={() => navigate('/estadisticas_anual')}
    sx={{ py: 0.8 }}
    startIcon={<AssessmentIcon />}
  >
    Estadísticas Anuales
  </Button>
        {/* NUEVO BOTÓN - Predecir Asistencia */}
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => handlePredecirAsistencia()}
          sx={{ py: 0.8 }}
          startIcon={<PsychologyIcon />}
        >
          Predecir Asistencia
        </Button>
        <Button variant="contained" onClick={() => openForm()} sx={{ py: 0.8 }}>
          Crear Nueva Reunión
        </Button>
      </Paper>

      {/* Tabla de reuniones */}
      <Paper
        elevation={2}
        sx={{
          mb: 1.5,
          transition: "box-shadow 0.3s",
          "&:hover": { boxShadow: 10 },
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: " rgb(2 135 209)" }}>
                <TableCell>Título</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((m) => (
                  <TableRow
                    key={m.id}
                    hover
                    sx={{
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scaleY(1.02)",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <TableCell>{m.title}</TableCell>
                    <TableCell>
                      {new Date(m.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{`${m.time.slice(0, 5)} hr`}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(m.status)}
                        size="small"
                        color={getStatusColor(m.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => openView(m)}
                        sx={{ p: 0.5 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {m.status === "Programada" && (
                        <IconButton
                          color="primary"
                          onClick={() => openForm(m)}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(m.id)}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: "gray", p: 0.5 }}
                        onClick={() => openQr(m)}
                      >
                        <QrCodeIcon />
                      </IconButton>
                      {(m.status === "Registro_Abierto" ||
                        m.status === "Retardos_Permitidos" ||
                        m.status === "Falta_No_Justificada" ||
                        m.status === "Terminada") && (
                        <IconButton
                          color="secondary"
                          sx={{ p: 0.5 }}
                          onClick={() =>
                            navigate(`/estadistica_reuniones/${m.id}`)
                          }
                        >
                          <AssessmentIcon />
                        </IconButton>
                      )}
                      {/* NUEVO BOTÓN - Predecir Asistencia por reunión individual */}
                      {(m.status === "Programada" || m.status === "Registro_Abierto") && (
                        <IconButton
                          color="primary"
                          sx={{ p: 0.5 }}
                          onClick={() => handlePredecirAsistencia()}
                        >
                          <PsychologyIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRows}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Diálogo detalle */}
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
          <Typography variant="body2">Tipo: {current?.type}</Typography>
          <Typography variant="body2">
            Estado: <Chip 
              label={getStatusLabel(current?.status)} 
              size="small" 
              color={getStatusColor(current?.status)} 
            />
          </Typography>
          <Typography variant="body2">
            Ubicación: {current?.location}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {current?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          {/* NUEVO BOTÓN - Predecir Asistencia en el diálogo de detalle */}
          {(current?.status === "Programada" || current?.status === "Registro_Abierto") && (
            <Button 
              onClick={() => handlePredecirAsistencia()} 
              size="small"
              startIcon={<PsychologyIcon />}
              color="primary"
              variant="outlined"
            >
              Predecir Asistencia
            </Button>
          )}
          <Button onClick={closeView} size="small">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo crear/editar */}
      <Dialog open={formOpen} onClose={closeForm} fullWidth>
        <DialogTitle>
          {editingId ? "Editar Reunión" : "Nueva Reunión"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Título"
                name="title"
                fullWidth
                size="small"
                value={formData.title}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Fecha"
                name="date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Hora"
                name="time"
                type="time"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.time}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  label="Tipo"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                >
                  <MenuItem value="Ordinaria">Ordinaria</MenuItem>
                  <MenuItem value="Extraordinaria">Extraordinaria</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ubicación"
                name="location"
                fullWidth
                size="small"
                value={formData.location}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} size="small">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={editingId ? handleUpdate : handleSave}
            size="small"
          >
            {editingId ? "Guardar Cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo QR */}
      <Dialog open={qrOpen} onClose={closeQr} fullWidth>
        <DialogTitle>Código QR</DialogTitle>
        <DialogContent>
          <Box
            ref={qrRef}
            sx={{ display: "flex", justifyContent: "center", p: 2 }}
          >
            {current ? (
              <QRCode value={String(current.id)} size={200} />
            ) : (
              <Typography>Cargando...</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadPdf} size="small">
            Descargar PDF
          </Button>
          <Button onClick={closeQr} size="small">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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