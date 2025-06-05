// src/pages/admin/AdminEncuestas.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteOutlineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


export default function AdminEncuestas() {
  // --- Estados de tabla y filtro ---
  const [encuestasList, setEncuestasList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos'); // “Todos” | “Encuesta” | “Votación”
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  // Al montar, traemos todas las encuestas/votaciones desde el backend:
   useEffect(() => {
     fetch('http://localhost:3001/api/encuestas-votaciones', {
       method: 'GET',
       credentials: 'include' // si tu servidor usa cookies/autenticación
     })
       .then(res => {
         if (!res.ok) throw new Error('Error al obtener encuestas/votaciones');
         return res.json();
       })
       .then(data => {
         
         setEncuestasList(data);
       })
       .catch(err => {
         console.error(err);
       });
   }, []);

  // --- Estados de formulario ---
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Encuesta',
    title: '',
    description: '',
    publicationDate: '',
    publicationTime: '',
    closeDate: '',
    closeTime: '',
    questions: []
  });

  // Para hacer scroll al último elemento (nueva pregunta)
  const endOfQuestionsRef = useRef(null);

  // --- Estados de vista detallada ---
  const [viewOpen, setViewOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // --- Snackbar ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const showSnackbar = (msg, sev = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });

 

  // --- Filtro y búsqueda sobre encuestasList ---
  const filtered = useMemo(() => {
    return encuestasList
      .filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter(item => {
        if (filterType === 'Encuesta') return item.type === 'Encuesta';
        if (filterType === 'Votación') return item.type === 'Votación';
        return true; // “Todos”
      });
  }, [encuestasList, search, filterType]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = e => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // --- Abrir/Cerrar formulario ---
  const openForm = item => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        type: item.type,
        title: item.title,
        description: item.description,
        publicationDate: item.publicationDate.split('T')[0],
        closeDate:       item.closeDate.split('T')[0],
        publicationTime: item.publicationTime,
        closeDate: item.closeDate,
        closeTime: item.closeTime,
        questions: item.questions.map(q => ({
          text: q.text,
           options: q.options.map(opt => opt.text) 
        }))
      });
    } else {
      setEditingId(null);
      setFormData({
        type: 'Encuesta',
        title: '',
        description: '',
        publicationDate: '',
        publicationTime: '',
        closeDate: '',
        closeTime: '',
        questions: []
      });
    }
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  // --- Manejadores de formulario simple ---
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Manejadores de preguntas u opciones ---
  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', ''] }]
    }));
  };
  const handleRemoveQuestion = idx => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };
  const handleQuestionChange = (idx, text) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === idx ? { ...q, text } : q
      )
    }));
  };
  const handleAddOption = qidx => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qidx ? { ...q, options: [...q.options, ''] } : q
      )
    }));
  };
  const handleRemoveOption = (qidx, oidx) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qidx) return q;
        if (q.options.length <= 2) return q; // no eliminar si quedan 2
        return { ...q, options: q.options.filter((_, j) => j !== oidx) };
      })
    }));
  };
  const handleOptionChange = (qidx, oidx, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qidx
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oidx ? value : opt
              )
            }
          : q
      )
    }));
  };

const formatDateTime = (dateStr, timeStr) => {
  // Si dateStr viene como "2025-06-04T06:00:00.000Z", nos quedamos solo con "2025-06-04"
  const datePart = typeof dateStr === 'string' && dateStr.includes('T')
    ? dateStr.split('T')[0]
    : dateStr;

  // Ahora sí concatenamos de forma segura "YYYY-MM-DDThh:mm"
  const dt = new Date(`${datePart}T${timeStr}`);
  if (isNaN(dt)) {
    // Si siguiera saliendo "Invalid Date", devolvemos un fallback
    return 'Fecha inválida';
  }

  const fechaFormateada = dt.toLocaleDateString('es-ES', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });
  const [hh, mm] = timeStr.split(':');
  return `${fechaFormateada} a las ${hh}:${mm} hr`;
};


  // Cada vez que cambie el número de preguntas, hacemos scroll al final
  useEffect(() => {
    if (endOfQuestionsRef.current) {
      endOfQuestionsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formData.questions.length]);

  // --- Guardar nueva encuesta/votación ---
 
    const handleSave = async () => {
    const {
      type,
      title,
      description,
      publicationDate,
      publicationTime,
      closeDate,
      closeTime,
      questions
    } = formData;

    // Validación mínima
    if (
      !title ||
      !publicationDate ||
      !publicationTime ||
      !closeDate ||
      !closeTime ||
      questions.length === 0
    ) {
      showSnackbar('Completa todos los campos y agrega al menos una pregunta', 'error');
      return;
    }
    // Validar que cada pregunta tenga texto y al menos 2 opciones no vacías
    for (let q of questions) {
      if (!q.text.trim()) {
        showSnackbar('Cada pregunta debe tener texto', 'error');
        return;
      }
      if (q.options.length < 2) {
        showSnackbar('Cada pregunta necesita al menos 2 opciones', 'error');
        return;
      }
      for (let opt of q.options) {
        if (!opt.trim()) {
          showSnackbar('Las opciones no pueden estar vacías', 'error');
          return;
        }
      }
    }
 try {
      // 1) Preparamos el cuerpo exactamente como el backend lo espera:
      const payload = {
        type,
        title,
        description,
        publication_date: publicationDate,   // ojo al nombre de campo
        publication_time: publicationTime,
        close_date: closeDate,
        close_time: closeTime,
        questions: questions.map(q => ({
          text: q.text.trim(),
          options: q.options.map(opt => opt.trim())
        }))
      };

      // 2) Llamamos al endpoint “/completo”
      const res = await fetch('http://localhost:3001/api/encuestas-votaciones/completo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include' // si tu servidor requiere cookies / auth
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear encuesta/votación');
      }

      const created = await res.json();
      // 3) Una vez exitoso, agregamos el resultado al listado
      setEncuestasList(prev => [created, ...prev]);
      showSnackbar('Encuesta/Votación creada exitosamente', 'success');
      closeForm();
    } catch (error) {
      console.error(error);
      showSnackbar(error.message, 'error');
    }
  
    
  };

  // --- Eliminar elemento ---
  const handleDelete = id => {
    setEncuestasList(prev => prev.filter(item => item.id !== id));
    showSnackbar('Elemento eliminado', 'success');
  };

  // --- Ver detalles ---
  const handleView = item => {

   const transformed = {
     ...item,
     questions: item.questions.map(q => ({
       text: q.text,
       options: q.options.map(o => o.text)
     }))
   };
   setCurrentItem(transformed);
   setViewOpen(true);
 };

  const closeView = () => setViewOpen(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* -------------------- Barra de búsqueda/filtro/crear -------------------- */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
          transition: 'box-shadow 0.3s',
          '&:hover': { boxShadow: 8 }
        }}
      >
        <TextField
          label="Buscar"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterType}
            label="Tipo"
            onChange={e => setFilterType(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Encuesta">Encuesta</MenuItem>
            <MenuItem value="Votación">Votación</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => openForm(null)}
        >
          Crear Encuesta/Votación
        </Button>
      </Paper>

      {/* -------------------------- Tabla principal -------------------------- */}
      <Paper
        elevation={2}
        sx={{
          mb: 1.5,
          transition: 'box-shadow 0.3s',
          '&:hover': { boxShadow: 10 }
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgb(2 135 209)' }}>
                <TableCell sx={{ color: '#fff', width: '15%' }}>Tipo</TableCell>
                <TableCell sx={{ color: '#fff', width: '30%' }}>Título</TableCell>
                <TableCell sx={{ color: '#fff', width: '20%' }}>Cierre</TableCell>
                <TableCell sx={{ color: '#fff', width: '15%' }}>Estado</TableCell>
                <TableCell align="center" sx={{ color: '#fff', width: '20%' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {filtered
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map(item => (
      <TableRow key={item.id} hover>
        <TableCell>{item.type}</TableCell>
        <TableCell>{item.title}</TableCell>
        <TableCell>
          {formatDateTime(item.closeDate, item.closeTime)}
        </TableCell>
        <TableCell>
          {item.estado === 'Programado' && (
            <Chip
              label="Programado"
              size="small"
              color="info"
              sx={{ color: '#fff' }}
            />
          )}
          {item.estado === 'Activo' && (
            <Chip
              label="Activo"
              size="small"
              color="success"
              sx={{ color: '#fff' }}
            />
          )}
          {item.estado === 'Cerrado' && (
            <Chip
              label="Cerrado"
              size="small"
              color="error"
              sx={{ color: '#fff' }}
            />
          )}
        </TableCell>
        <TableCell align="center">
          {/* Ver: siempre disponible */}
          <IconButton
            size="small"
            onClick={() => handleView(item)}
            sx={{ color: 'primary.main' }}
            aria-label="Ver detalles"
          >
            <VisibilityIcon />
          </IconButton>

          {/* Editar: solo si Programado */}
          {item.estado === 'Programado' && (
            <IconButton
              size="small"
              onClick={() => openForm(item)}
              sx={{ color: 'primary.main', ml: 1 }}
              aria-label="Editar"
            >
              <EditIcon />
            </IconButton>
          )}

          {/* Estadísticas: solo si Activo o Cerrado */}
          {(item.estado === 'Activo' || item.estado === 'Cerrado') && (
            <IconButton
              size="small"
              onClick={() => navigate(`/estadisticas_encuestas_votos/${item.id}`)}
              sx={{ color: 'purple', ml: 1 }}
              aria-label="Estadísticas"
            >
              <BarChartIcon />
            </IconButton>
          )}

          {/* Eliminar: siempre disponible */}
          <IconButton
            size="small"
            onClick={() => handleDelete(item.id)}
            color="error"
            sx={{ ml: 1 }}
            aria-label="Eliminar"
          >
            <DeleteIcon />
          </IconButton>
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

      {/* ------------------ Dialogo Crear/Editar ------------------ */}
      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? 'Editar Encuesta/Votación' : 'Nueva Encuesta/Votación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Tipo */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Tipo"
                  onChange={handleFormChange}
                >
                  <MenuItem value="Encuesta">Encuesta</MenuItem>
                  <MenuItem value="Votación">Votación</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Título */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="Título"
                name="title"
                fullWidth
                size="small"
                value={formData.title}
                onChange={handleFormChange}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>

            {/* Fecha y hora de publicación */}
            <Grid item xs={6} sm={3}>
              <TextField
                label="Fecha publicación"
                name="publicationDate"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.publicationDate}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Hora publicación"
                name="publicationTime"
                type="time"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.publicationTime}
                onChange={handleFormChange}
              />
            </Grid>

            {/* Fecha y hora de cierre */}
            <Grid item xs={6} sm={3}>
              <TextField
                label="Fecha cierre"
                name="closeDate"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.closeDate}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Hora cierre"
                name="closeTime"
                type="time"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.closeTime}
                onChange={handleFormChange}
              />
            </Grid>

            {/* Preguntas dinámicas */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Preguntas
              </Typography>
            </Grid>

            {/* … dentro de <DialogContent> … */}

<Grid container spacing={2}>
  {formData.questions.map((q, qidx) => (
    <Grid item key={qidx} xs={12} >
      <Collapse in timeout={200} sx={{ mb: 2 }} ref={qidx === formData.questions.length - 1 ? endOfQuestionsRef : null}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <TextField
              label={`Pregunta ${qidx + 1}`}
              fullWidth
              size="small"
              value={q.text}
              onChange={e => handleQuestionChange(qidx, e.target.value)}
            />
            <IconButton
              color="error"
              size="small"
              onClick={() => handleRemoveQuestion(qidx)}
              sx={{ ml: 1 }}
              aria-label="Eliminar pregunta"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>

          {q.options.map((opt, oidx) => (
            <Grid
              container
              spacing={1}
              alignItems="center"
              key={oidx}
              sx={{ mb: 1 }}
            >
              <Grid item xs={q.options.length > 2 ? 10 : 12}>
                <TextField
                  label={`Opción ${oidx + 1}`}
                  fullWidth
                  size="small"
                  value={opt}
                  onChange={e => handleOptionChange(qidx, oidx, e.target.value)}
                />
              </Grid>
              {q.options.length > 2 && (
                <Grid item xs={2}>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveOption(qidx, oidx)}
                    aria-label="Eliminar opción"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}

          <Button
            variant="text"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleAddOption(qidx)}
          >
            Agregar Opción
          </Button>
        </Paper>
      </Collapse>
    </Grid>
  ))}
</Grid>


            <Box ref={endOfQuestionsRef} />

            <Grid item xs={12}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                Agregar Pregunta
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeForm} size="small">
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            {editingId ? 'Guardar Cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------ Dialogo Ver Detalles ------------------ */}
      <Dialog open={viewOpen} onClose={closeView} fullWidth maxWidth="md">
        <DialogTitle>Detalle</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>Tipo:</strong> {currentItem?.type}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Título:</strong> {currentItem?.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Descripción:</strong>
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-line', ml: 1 }}
          >
            {currentItem?.description}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
  <strong>Publicación:</strong>{' '}
  {currentItem
    ? formatDateTime(currentItem.publicationDate, currentItem.publicationTime)
    : ''}
</Typography>
<Typography variant="body2" sx={{ mt: 1 }}>
  <strong>Cierre:</strong>{' '}
  {currentItem
    ? formatDateTime(currentItem.closeDate, currentItem.closeTime)
    : ''}
</Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Preguntas:</Typography>
            {currentItem?.questions.map((q, qidx) => (
              <Paper key={qidx} sx={{ p: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {`Pregunta ${qidx + 1}: ${q.text}`}
                </Typography>
                <Box sx={{ pl: 2, mt: 0.5 }}>
                  {q.options.map((opt, oidx) => (
                    <Typography key={oidx} variant="body2">
                      {`Opción ${oidx + 1}: ${opt}`}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView} size="small">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------------------- Snackbar -------------------- */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
