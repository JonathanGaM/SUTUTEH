import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  TableSortLabel,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { API_URL } from "../../../../config/apiConfig";



export default function AdminPreguntas() {
  const [replyLoading, setReplyLoading] = useState(false);
  // Datos iniciales con arreglo de respuestas
 
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');

  // Dialogs & feedback
  const [viewOpen, setViewOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatus = q =>
    Array.isArray(q.responses) && q.responses.length > 0
      ? 'Respondida'
      : 'Sin responder';

  // Filtrado
  const filtered = useMemo(() => {
    return questions
      .filter(q => {
        if (filterTipo === 'Agremiado') return q.registrado;
        if (filterTipo === 'No agremiado') return !q.registrado;
        return true;
      })
      .filter(q => {
        if (filterEstado === 'Sin responder') return getStatus(q) === 'Sin responder';
        if (filterEstado === 'Respondida') return getStatus(q) === 'Respondida';
        return true;
      })
      .filter(q =>
        (`${q.nombre} ${q.apellidoP} ${q.apellidoM}`)
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        q.question.toLowerCase().includes(search.toLowerCase())
      );
  }, [questions, search, filterTipo, filterEstado]);

  // Ordenamiento
  const sorted = useMemo(() => {
    const comparator = (a, b) => {
      const aDate = new Date(a[orderBy]);
      const bDate = new Date(b[orderBy]);
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    };
    return [...filtered].sort(comparator);
  }, [filtered, order, orderBy]);

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };

  const openView = q => { setCurrent(q); setViewOpen(true); };
  const closeView = () => { setViewOpen(false); setCurrent(null); };

  const openReply = q => {
    setCurrent(q);
    setReplyText('');
    setReplyOpen(true);
  };
  const closeReply = () => {
    setReplyOpen(false);
    setCurrent(null);
    setReplyText('');
  };

 

const handleSaveReply = () => {
  if (!replyText.trim() || replyLoading) return;
  setReplyLoading(true);

  // 1) Decide qué endpoint usar según el tipo de usuario
  const url = current.registrado
    ? `${API_URL}/api/preguntas/${current.id}/responder-admin`
    : `${API_URL}/api/preguntas/${current.id}/responder`;

  // 2) Llama al endpoint correspondiente
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respuesta: replyText.trim() })
  })
    .then(res => {
      if (!res.ok) throw new Error('Falló al guardar');
      return res.json();
    })
    .then(() => {
      // 3) Actualiza tu estado local
      setQuestions(prev =>
        prev.map(q =>
          q.id === current.id
            ? {
                ...q,
                responses: [...q.responses, replyText.trim()],
                estado: 'respondido'
              }
            : q
        )
      );
      closeReply();
      setSnackbar({
        open: true,
        message: 'Respuesta enviada correctamente',
        severity: 'success'
      });
    })
    .catch(err => {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Error al guardar respuesta',
        severity: 'error'
      });
    })
    .finally(() => {
      setReplyLoading(false);
    });
};



  const confirmDelete = id => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const cancelDelete = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

 const handleDelete = id => {
    fetch(`${API_URL}/api/preguntas/${id}`, { method: 'DELETE' })
     .then(res => {
        if (!res.ok) throw new Error('No se pudo eliminar');
        return res.json();
      })
      .then(() => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setConfirmOpen(false);
        setSnackbar({ open:true, message:'Pregunta eliminada', severity:'info' });
      })
      .catch(err => {
        console.error(err);
        setSnackbar({ open:true, message:'Error al eliminar', severity:'error' });
      });
  };
useEffect(() => {
  // Función que carga preguntas
  const loadQuestions = () => {
    fetch(`${API_URL}/api/preguntas`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => {
        console.error('Error cargando preguntas:', err);
        setSnackbar({ open:true, message:'No se pudo cargar preguntas', severity:'error' });
      });
  };

  // Carga inicial
  loadQuestions();

  // Vuelve a cargar cada 15 segundos
  const intervalId = setInterval(loadQuestions, 15000);

  // Limpieza al desmontar
  return () => clearInterval(intervalId);
}, []);



  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Gestión de Preguntas
      </Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tipo de usuario</InputLabel>
          <Select
            value={filterTipo}
            label="Tipo de usuario"
            onChange={e => setFilterTipo(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Agremiado">Agremiado</MenuItem>
            <MenuItem value="No agremiado">No agremiado</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterEstado}
            label="Estado"
            onChange={e => setFilterEstado(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Sin responder">Sin responder</MenuItem>
            <MenuItem value="Respondida">Respondida</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
         <TableRow sx={{ backgroundColor: "rgb(183, 205, 239)" }}>
                
                
                <TableCell>Nombre completo</TableCell>
                <TableCell sortDirection={orderBy === 'date' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={order}
                    onClick={() => handleRequestSort('date')}
                  >
                    Fecha
                  </TableSortLabel>
                </TableCell>
                <TableCell>Pregunta</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron preguntas
                  </TableCell>
                </TableRow>
              ) : (
                sorted
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(q => (
                    <TableRow key={q.id} hover>
                      
                      <TableCell>{`${q.nombre} ${q.apellidoP} ${q.apellidoM}`}</TableCell>
                      <TableCell>{q.date}</TableCell>
                      <TableCell>{q.question}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatus(q)}
                          color={getStatus(q) === 'Respondida' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver pregunta">
                          <IconButton onClick={() => openView(q)}>
                            <VisibilityIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Responder pregunta">
                          <IconButton onClick={() => openReply(q)}>
                            <ReplyIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar pregunta">
                          <IconButton onClick={() => confirmDelete(q.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRows}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Ver pregunta */}
      <Dialog open={viewOpen} onClose={closeView} fullWidth>
        {current && (
          <>
            <DialogTitle>Ver Pregunta</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de usuario: {current.registrado ? 'Agremiado' : 'No agremiado'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Nombre: {`${current.nombre} ${current.apellidoP} ${current.apellidoM}`}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Correo: {current.correo}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Teléfono: {current.telefono}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Fecha: {current.date}
              </Typography>

              {/* Pregunta */}
              <Typography
                variant="body1"
                gutterBottom
                sx={{
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  mt: 2,
                }}
              >
                {current.question}
              </Typography>

              {/* Respuestas */}
              {current.responses?.length > 0 ? (
                current.responses.map((resp, i) => (
                  <Box
                    key={i}
                    sx={{
                      backgroundColor: '#e8f5e9',
                      borderRadius: 1,
                      p: 2,
                      mb: 2
                    }}
                  >
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Respuesta {i + 1}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {resp}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Sin respuestas aún.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  closeView();
                  openReply(current);
                }}
              >
                Responder
              </Button>
              <Button onClick={closeView}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Responder pregunta */}
      <Dialog open={replyOpen} onClose={closeReply} fullWidth>
        <DialogTitle>Responder Pregunta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>{current?.question}</strong>
          </Typography>
          <TextField
            label="Respuesta"
            multiline
            rows={4}
            fullWidth
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReply}>Cancelar</Button>
          <Button
   variant="contained"
   onClick={handleSaveReply}
   disabled={replyLoading || !replyText.trim()}
 >
   {replyLoading
     ? <CircularProgress size={20} color="inherit" />
     : 'Enviar'
   }
 </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={confirmOpen} onClose={cancelDelete}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que quieres eliminar esta pregunta?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button color="error" onClick={() => handleDelete(deleteId)}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}