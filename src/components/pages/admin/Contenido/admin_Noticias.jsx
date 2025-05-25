  import React, { useState, useEffect, useMemo, useRef } from 'react';
  import axios from 'axios';
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
    CircularProgress,
    Chip
  } from '@mui/material';
  import SearchIcon from '@mui/icons-material/Search';
  import AddIcon from '@mui/icons-material/Add';
  import VisibilityIcon from '@mui/icons-material/Visibility';
  import EditIcon from '@mui/icons-material/Edit';
  import DeleteIcon from '@mui/icons-material/DeleteOutlined';

  export default function AdminNoticias() {
    const [newsList, setNewsList] = useState([]);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('Todos');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
      title: '',
      desc: '',
      contenido: '',
      date: '',
      images: [],
      video: null 
    });
  const [videoPreview, setVideoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

    
    const [preview, setPreview] = useState([]);

    const [viewOpen, setViewOpen] = useState(false);
    const [currentNews, setCurrentNews] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const fileInput = useRef();

    const showSnackbar = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

    // Fetch noticias
    useEffect(() => {
      fetchNoticias();
    }, []);


    const fetchNoticias = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/noticias');
        // adapt returned fields
        const adapted = data.map(n => ({
          id: n.id,
          title: n.titulo,
          desc: n.descripcion,
          contenido: n.contenido,
          date: n.fecha_publicacion.split('T')[0],
          estado: n.estado,
          imageUrls: JSON.parse(n.imagenes),
          videoUrl: n.url_video || null
        }));
        setNewsList(adapted);
      } catch (err) {
        console.error(err);
        showSnackbar('Error cargando noticias', 'error');
      }
    };

    // Status: publicado o programado
    const getStatus = item => {
      const today = new Date().toISOString().slice(0, 10);
      return item.date > today ? 'Programado' : 'Publicado';
    };

    const handleSearch = e => setSearch(e.target.value);
    const handleFilterDate = e => setFilterDate(e.target.value);

    const filtered = useMemo(() => {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();
      return newsList
        .filter(item =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.desc.toLowerCase().includes(search.toLowerCase())
        )
        .filter(item => {
          if (filterDate === 'Hoy') return item.date === today;
          if (filterDate === 'Semana') {
            const diff = (now - new Date(item.date)) / (1000*60*60*24);
            return diff <= 7;
          }
          if (filterDate === 'Mes') {
            const diff = (now - new Date(item.date)) / (1000*60*60*24);
            return diff <= 30;
          }
          if (filterDate === 'Publicado')  return getStatus(item) === 'Publicado';
          if (filterDate === 'Programado') return getStatus(item) === 'Programado';
          return true;
        });
    }, [newsList, search, filterDate]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };

    const openForm = item => {
      if (item) {
        setEditingId(item.id);
        setFormData({
          title: item.title,
          desc: item.desc,
          contenido: item.contenido,
          date: item.date,
          images: [],
          video: null
        });
        setPreview(item.imageUrls);
        setVideoPreview(item.videoUrl);
      } else {
        setEditingId(null);
        setFormData({ title: '', desc: '', contenido: '', date: '', images: [], video: null});
        setPreview([]);
        setVideoPreview(null);
      }
      setFormOpen(true);
    };
    const closeForm = () => setFormOpen(false);

    const handleFormChange = e => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

  

    const handleImage = e => {
  const files = Array.from(e.target.files);
  if (files.length < 1) {
    showSnackbar('Selecciona al menos 1 imagen', 'error');
    return;
  }
  if (files.length > 5) {
    showSnackbar('Máximo 5 imágenes permitido', 'error');
    return;
  }
  // Limpiamos preview antigua
  setPreview([]);
  setFormData(prev => ({ ...prev, images: files }));
  const urls = files.map(f => URL.createObjectURL(f));
  setPreview(urls);
};
    // Después de handleImage:
  // 2. Modifica handleVideo para generar la URL y guardarla:
  const handleVideo = e => {
    const file = e.target.files[0];
    if (!file) return;

    // validación de tamaño (100 MB)
    if (file.size > 100 * 1024 * 1024) {
      showSnackbar('El video supera 100 MB', 'error');
      return;
    }

    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (v.duration > 360) {
        showSnackbar('El video dura más de 6 minutos', 'error');
      } else {
        setFormData(prev => ({ ...prev, video: file }));
        setVideoPreview(url);            // ← guardamos URL para previsualizar
        showSnackbar('Video seleccionado');
      }
    };
  };

    const handleSave = async () => {
       if (isSaving) return;
   setIsSaving(true);
   
      const { title, desc, contenido, date, images,video } = formData;
      if (!title || !desc || !contenido || !date || (images.length<1 && !editingId)) {
        setIsSaving(false);
        showSnackbar('Rellena todos los campos y selecciona al menos 1 imagen', 'error');
        return;
      }
      const form = new FormData();
      form.append('titulo', title);
      form.append('descripcion', desc);
      form.append('contenido', contenido);
      form.append('fecha_publicacion', date);
      form.append('estado', getStatus({date}));
      images.forEach(file => form.append('imagenes', file));
      
      if (video) form.append('video', video);

      try {
        if (editingId) {
          await axios.put(
            `http://localhost:3001/api/noticias/${editingId}`,
            form,
            { headers: {'Content-Type':'multipart/form-data'} }
          );
          showSnackbar('Noticia actualizada');
        } else {
          await axios.post(
            'http://localhost:3001/api/noticias',
            form,
            { headers: {'Content-Type':'multipart/form-data'} }
          );
          showSnackbar('Noticia creada');
        }
        closeForm();
        fetchNoticias();
      } catch (err) {
        console.error(err);
        showSnackbar('Error guardando noticia', 'error');
      }
      finally {
     // Siempre reactivar el botón
      setIsSaving(false);
    }
    };

    const handleDelete = async id => {
      try {
        await axios.delete(`http://localhost:3001/api/noticias/${id}`);
        showSnackbar('Noticia eliminada');
        fetchNoticias();
      } catch (err) {
        console.error(err);
        showSnackbar('Error al eliminar', 'error');
      }
    };

    const handleView = item => { setCurrentNews(item); setViewOpen(true); };
    const closeView = () => setViewOpen(false);
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
            label="Buscar noticia"
            value={search}
            onChange={handleSearch}
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
              value={filterDate}
              label="Filtrar"
              onChange={handleFilterDate}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Hoy">Hoy</MenuItem>
              <MenuItem value="Semana">Última Semana</MenuItem>
              <MenuItem value="Mes">Último Mes</MenuItem>
              <MenuItem value="Publicado">Publicados</MenuItem>
              <MenuItem value="Programado">Programados</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openForm()}
            size="small"
          >
            Crear Noticia
          </Button>
        </Paper>

        {/* Tabla de noticias */}
        <Paper
          elevation={2}
          sx={{
            mb: 1.5,
            transition: "box-shadow 0.3s",
            "&:hover": { boxShadow: 10 },
          }}
        >
          <TableContainer>
            <Table sx={{ tableLayout: "fixed" /* 1 */ }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgb(2 135 209)" }}>
                  <TableCell sx={{ color: "#fff", width: "20%" }}>
                    Título
                  </TableCell>{" "}
                  {/* 2 */}
                  <TableCell sx={{ color: "#fff", width: "15%" }}>
                    Fecha
                  </TableCell>{" "}
                  {/* 2 */}
                  <TableCell sx={{ color: "#fff", width: "40%" }}>
                    Descripción
                  </TableCell>{" "}
                  {/* 2 */}
                  <TableCell sx={{ color: "#fff" }}>Estado</TableCell>
                  <TableCell align="center" sx={{ color: "#fff" }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap" /* 3 */,
                          overflow: "hidden" /* 3 */,
                          textOverflow: "ellipsis" /* 3 */,
                        }}
                      >
                        {item.desc}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatus(item)}
                          size="small"
                          color={
                            getStatus(item) === "Publicado" ? "success" : "info"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleView(item)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openForm(item)}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(item.id)}
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

        {/* Dialog crear/editar noticia */}
        <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="md">
          <DialogTitle>
            {editingId ? "Editar Noticia" : "Nueva Noticia"}
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Descripción (resumen)"
                  name="desc"
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  value={formData.desc}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Contenido completo"
                  name="contenido"
                  multiline
                  rows={12}
                  fullWidth
                  size="small"
                  value={formData.contenido}
                  onChange={handleFormChange}
                />
              </Grid>
              {/* Dentro de <DialogContent> y antes del Grid de imágenes */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Button variant="outlined" component="label" size="small">
                    Seleccionar video (máx. 6 min, 100 MB)
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={handleVideo}
                    />
                  </Button>

                  {videoPreview && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Vista previa:</Typography>
                      <video
                        src={videoPreview}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: 240,
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Button variant="outlined" component="label" size="small">
                    Seleccionar imágenes (1-5)
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      ref={fileInput}
                      onChange={handleImage}
                    />
                  </Button>
                  <Box
                    sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {preview.map((url, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={url}
                        alt=""
                        sx={{ height: 80 }}
                        onClick={() => setImageDialogOpen(true)}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeForm} size="small">
              Cancelar
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              size="small"
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress color="inherit" size={16} />
                ) : editingId ? (
                  <EditIcon />
                ) : (
                  <AddIcon />
                )
              }
            >
              {isSaving
                ? editingId
                  ? "Guardando..."
                  : "Creando..."
                : editingId
                ? "Guardar"
                : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog ver noticia */}
        <Dialog open={viewOpen} onClose={closeView} fullWidth maxWidth="md">
          <DialogTitle>Detalle de Noticia</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <strong>Título:</strong> {currentNews?.title}
            </Typography>
            <Typography variant="body2">
              <strong>Fecha:</strong> {currentNews?.date}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Descripción:
              </Box>
            </Typography>
            {/* Texto con saltos de línea preservados */}
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-line", // ← respeta '\n'
                mt: 0.5,
                ml: 1, // sangría opcional
              }}
            >
              {currentNews?.desc}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Contenido:
              </Box>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-line",
                mt: 0.5,
                ml: 1,
              }}
            >
              {currentNews?.contenido}
            </Typography>

            <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {currentNews?.imageUrls?.filter(url => Boolean(url)).map((url, i) => (
                <Box
                  key={i}
                  component="img"
                  src={url}
              
                  alt={`Imagen ${i + 1}`}
        sx={{ width: "30%", borderRadius: 1 }}
                />
              ))}
            </Box>
            {currentNews?.videoUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Video asociado:
                </Typography>
                <video
                  src={currentNews.videoUrl}
                  controls
                  style={{ width: "100%", maxHeight: 240, borderRadius: 4 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeView} size="small">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog imágenes */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogContent>
            <Box
              component="img"
              src={preview[0]}
              alt="Vista ampliada"
              sx={{ width: "100%" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageDialogOpen(false)} size="small">
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
