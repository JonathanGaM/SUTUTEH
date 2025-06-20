import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import {
  Container, Box, Button, Paper, TextField, IconButton,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, Grid, Typography, useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  DeleteOutlined as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  Slideshow as SlideshowIcon,
  InsertDriveFile as InsertDriveFileIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';

// Base URL for metadata CRUD and file upload
const API_BASE = 'http://localhost:3001/api/transparencia';

export default function AdminTransparencia() {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUrl, setViewUrl] = useState('');

  const [form, setForm] = useState({ title: '', categoryId: '', file: null });
  const [filePreview, setFilePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    fetchItems();
    axios.get(`${API_BASE}/categorias`)
      .then(({ data }) => setCategories(data))
      .catch(() => showSnackbar('Error cargando categorías', 'error'));
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(API_BASE);
      setItems(data.map(d => ({
        id: d.id,
        title: d.titulo,
        category: d.categoria,
        createdAt: d.fecha_publicacion.split('T')[0],
        url: d.url
      })));
    } catch {
      showSnackbar('Error cargando registros', 'error');
    }
  };

  const filtered = useMemo(() =>
    items
      .filter(it => it.title.toLowerCase().includes(search.toLowerCase()))
      .filter(it => !filterCategory || it.category === filterCategory)
      .filter(it => !filterDate || it.createdAt === filterDate)
  , [items, search, filterCategory, filterDate]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };

  const openForm = item => {
    if (item) {
      setEditing(item);
      setForm({
        title: item.title,
        categoryId: categories.find(c => c.nombre === item.category)?.id || '',
        file: null
      });
    } else {
      setEditing(null);
      setForm({ title: '', categoryId: '', file: null });
    }
    setFilePreview(null);
    setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); fetchItems(); };

  const handleDeleteClick = item => {
    setToDelete(item);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (!toDelete) return;
    try {
      await axios.delete(`${API_BASE}/${toDelete.id}`);
      showSnackbar('Documento eliminado con éxito');
      fetchItems();
    } catch {
      showSnackbar('Error al eliminar', 'error');
    }
    setToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setForm(prev => ({ ...prev, file: f }));
    setFilePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        // PUT para editar solo metadatos
        await axios.put(`${API_BASE}/${editing.id}`, {
          titulo: form.title,
          categoriaId: form.categoryId
        });
        showSnackbar('Registro actualizado correctamente');
      } else {
        // POST para crear nuevo con archivo
        const fd = new FormData();
        fd.append('file', form.file);
        fd.append('titulo', form.title);
        fd.append('categoriaId', form.categoryId);

        await axios.post(API_BASE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showSnackbar('Documento creado con éxito');
      }
      closeForm();
    } catch {
      showSnackbar('Error al guardar', 'error');
    }
  };

  const getIconByExt = ext => {
    if (ext === 'pdf') return <PictureAsPdfIcon fontSize="large" />;
    if (['doc','docx'].includes(ext)) return <DescriptionIcon fontSize="large" />;
    if (['xls','xlsx'].includes(ext)) return <TableChartIcon fontSize="large" />;
    if (['ppt','pptx'].includes(ext)) return <SlideshowIcon fontSize="large" />;
    return <InsertDriveFileIcon fontSize="large" />;
  };

  const renderFilePreview = () => {
    if (!form.file) return null;
    const name = form.file.name;
    const ext = name.split('.').pop().toLowerCase();
    return (
      <Box sx={{ width: 200, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid', borderColor: theme.palette.divider, borderRadius: 1, bgcolor: theme.palette.background.paper, ml: 2, p: 1 }}>
        {getIconByExt(ext)}
        <Typography variant="body2" noWrap sx={{ maxWidth: 180, textAlign: 'center' }}>{name}</Typography>
      </Box>
    );
  };

  // Nuevo: renderizar archivo actual en modo edición
  const renderCurrentFile = () => {
    if (!editing || !editing.url) return null;
    const fileName = editing.url.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();
    return (
      <Box sx={{ width: 200, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid', borderColor: theme.palette.divider, borderRadius: 1, bgcolor: theme.palette.background.default, ml: 2, p: 1 }}>
        {getIconByExt(ext)}
        <Typography variant="body2" noWrap sx={{ maxWidth: 180, textAlign: 'center' }}>{fileName}</Typography>
        <Typography variant="caption" color="text.secondary">Archivo actual</Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment> }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            label="Categoría"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {categories.map(c =>
              <MenuItem key={c.id} value={c.nombre}>{c.nombre}</MenuItem>
            )}
          </Select>
        </FormControl>
        <TextField
          label="Fecha de creación"
          type="date"
          size="small"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Button variant="contained" startIcon={<AddIcon/>} onClick={() => openForm(null)}>
          Nuevo
        </Button>
      </Paper>

      <Paper elevation={2} sx={{ mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: '#fff' }}>Título</TableCell>
                <TableCell sx={{ color: '#fff' }}>Categoría</TableCell>
                <TableCell sx={{ color: '#fff' }}>Creación</TableCell>
                <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage).map(it => (
                <TableRow key={it.id} hover>
                  <TableCell>{it.title}</TableCell>
                  <TableCell>{it.category}</TableCell>
                  <TableCell>{it.createdAt}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => { setViewUrl(it.url); setViewOpen(true); }}>
                      <VisibilityIcon/>
                    </IconButton>
                    <IconButton size="small" onClick={() => openForm(it)}>
                      <EditIcon/>
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(it)}>
                      <DeleteIcon/>
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

      {/* Vista previa */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Vista previa</DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh' }}>
          {viewUrl.toLowerCase().endsWith('.pdf')
            ? <object data={viewUrl} type="application/pdf" width="100%" height="100%">
                <Typography>No se puede mostrar el PDF. <a href={viewUrl} target="_blank" rel="noopener">Abrir</a></Typography>
              </object>
            : <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewUrl)}`} width="100%" height="100%" frameBorder="0" 
              />
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
          <Button component="a" href={viewUrl} target="_blank">Abrir original</Button>
        </DialogActions>
      </Dialog>

      {/* Nuevo / Editar */}
      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Editar registro' : 'Nuevo registro'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Título"
                  name="title"
                  fullWidth required
                  value={form.title}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    label="Categoría"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                  >
                    {categories.map(c =>
                      <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Archivo: botón solo para nuevo registro */}
              {!editing && (
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="contained" component="label">
                    Subir archivo
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {filePreview && renderFilePreview()}
                </Grid>
              )}

              {/* Mostrar archivo actual en modo edición */}
              {editing && (
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    Archivo actual:
                  </Typography>
                  {renderCurrentFile()}
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<UploadFileIcon/>}>
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar este documento?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}