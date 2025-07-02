
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import {
  Container, Box, Button, Paper, TextField, IconButton,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, Grid, Typography
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


// Direct PHP endpoint for file upload
const UPLOAD_PHP_URL = 'https://portal.sututeh.com/upload.php';

export default function AdminDocumentos() {
  const [docsList, setDocsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUrl, setViewUrl] = useState('');

  const [docForm, setDocForm] = useState({
    nombre: '', descripcion: '', categoriaId: '', permisoAcceso: '', imgPortada: null, archivo: null
  });
  const [imgPreview, setImgPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

  useEffect(() => {
    fetchDocumentos();
    axios.get(`/api/documentos/categorias`)
      .then(({ data }) => setCategories(data))
      .catch(err => {
        console.error('Error cargando categorías', err);
        showSnackbar('Error cargando categorías', 'error');
      });
  }, []);

  const fetchDocumentos = async () => {
    try {
      const { data } = await axios.get(`/api/documentos`);
      setDocsList(data.map(d => ({
        id: d.id,
        nombre: d.nombre,
        descripcion: d.descripcion,
        fecha: d.fecha_publicacion.split('T')[0],
        categoria: d.categoria,
        permiso: d.permiso,
        portada: d.portada,
        url: d.url
      })));
    } catch (err) {
      console.error('Error cargando documentos', err);
      showSnackbar('Error cargando documentos', 'error');
    }
  };

  const filtered = useMemo(() => docsList
    .filter(item => item.nombre.toLowerCase().includes(search.toLowerCase()) || item.descripcion.toLowerCase().includes(search.toLowerCase()))
    .filter(item => filterCategory === 'Todos' || item.categoria === filterCategory)
  , [docsList, search, filterCategory]);

  const handleChangePage = (_, np) => setPage(np);
  const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };

  const openForm = doc => {
    if (doc) {
      setEditingDoc(doc);
      setDocForm({
        nombre: doc.nombre,
        descripcion: doc.descripcion,
        categoriaId: categories.find(c => c.nombre === doc.categoria)?.id || '',
        permisoAcceso: doc.permiso === 'Solo Administradores' ? 2 : 1,
        imgPortada: null,
        archivo: null
      });
      setImgPreview(doc.portada);
    } else {
      setEditingDoc(null);
      setDocForm({ nombre: '', descripcion: '', categoriaId: '', permisoAcceso: '', imgPortada: null, archivo: null });
      setImgPreview(null);
    }
    setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); fetchDocumentos(); };

  const handleDelete = async item => {
    try {
      // 1.a) Borra el archivo físicamente en Hostinger
      const fileName = item.url.split('/').pop();
      await axios.delete(UPLOAD_PHP_URL, { data: { file: fileName } });

      // 1.b) Borra el registro en la base de datos
      await axios.delete(`/api/documentos/${item.id}`);

      showSnackbar('Documento y archivo eliminados');
      fetchDocumentos();
    } catch (err) {
      console.error('Error eliminando documento', err);
      showSnackbar('Error al eliminar', 'error');
    }
  };

  const handleChange = e => setDocForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImgChange = e => {
    const f = e.target.files[0];
    if (f) { setDocForm(prev => ({ ...prev, imgPortada: f })); setImgPreview(URL.createObjectURL(f)); }
  };
  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f) setDocForm(prev => ({ ...prev, archivo: f }));
  };

const handleSubmit = async e => {
  e.preventDefault();
  try {
    // 1) Subir portada si la hay
    let portadaUrl = null;
    if (docForm.imgPortada) {
      const fdPort = new FormData();
      fdPort.append('portada', docForm.imgPortada);
      const { data } = await axios.post(
        `/api/documentos/subirPortada`,
        fdPort,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      portadaUrl = data.url;
    }

  

    
  if (editingDoc) {
      // ----- METADATA ONLY (sin tocar archivo_url) -----
      const formData = new FormData();
     formData.append('nombre', docForm.nombre);
      formData.append('descripcion', docForm.descripcion);
      formData.append('categoriaId', docForm.categoriaId);
      formData.append('permisoAcceso', docForm.permisoAcceso);
      // si cambiaron portada, la incluimos
      if (portadaUrl) formData.append('portada', docForm.imgPortada);

      await axios.put(
        `/api/documentos/${editingDoc.id}/metadata`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      showSnackbar('Metadatos actualizados');
    } else {
      // ----- CREACIÓN ORIGINAL -----
      // 2) Subir archivo siempre
      const fdFile = new FormData();
      fdFile.append('file', docForm.archivo);
      const { data: fdata } = await axios.post(
        UPLOAD_PHP_URL,
        fdFile,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const fileUrl = fdata.url;
      const payload = {
        nombre: docForm.nombre,
        descripcion: docForm.descripcion,
        categoriaId: docForm.categoriaId,
       permisoAcceso: docForm.permisoAcceso,
        imgPortada: portadaUrl,
        archivoUrl: fileUrl
      };
      await axios.post(`/api/documentos`, payload);
      showSnackbar('Documento creado');
    }

    closeForm();
  } catch (err) {
    console.error('Error en submit', err);
    showSnackbar('Error al guardar documento', 'error');
  }
};
// justo después de los useState y antes de renderFilePreview()
const getIconByExt = ext => {
  if (ext === 'pdf') return <PictureAsPdfIcon sx={{ fontSize: 60 }} />;
  if (['doc','docx'].includes(ext)) return <DescriptionIcon sx={{ fontSize: 60 }} />;
  if (['xls','xlsx'].includes(ext)) return <TableChartIcon sx={{ fontSize: 60 }} />;
  if (['ppt','pptx'].includes(ext)) return <SlideshowIcon sx={{ fontSize: 60 }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 60 }} />;
};


  const renderFilePreview = () => {
  let name, ext, IconComponent;

  if (docForm.archivo) {
    // nuevo archivo seleccionado
    name = docForm.archivo.name;
    ext  = name.split('.').pop().toLowerCase();
    IconComponent = getIconByExt(ext);

  } else if (editingDoc) {
    // en edición, muestro el existente
    name = editingDoc.url.split('/').pop();
    ext  = name.split('.').pop().toLowerCase();
    IconComponent = getIconByExt(ext);

  } else {
    return null;
  }

  return (
    <Box
      sx={{
        width: 200, height: 300,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        border: '1px solid #ccc', borderRadius: 1,
        backgroundColor: '#f5f5f5', ml: 2,overflow: 'hidden',            // evita que el contenido se salga
       p: 1,    
      }}
    >
      {IconComponent}
      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', px: 1,width: '100%',                // ocupa todo el ancho del box
        whiteSpace: 'normal',
wordBreak: 'break-word',
         textOverflow: 'ellipsis' }}>
        {name}
      </Typography>
    </Box>
  );
};


  return (
    
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 1.5, mb: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar documento"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small" sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <FormControl size="small">
          <InputLabel>Categoría</InputLabel>
          <Select value={filterCategory} label="Categoría" onChange={e => setFilterCategory(e.target.value)}>
            <MenuItem value="Todos">Todos</MenuItem>
            {categories.map(cat => <MenuItem key={cat.id} value={cat.nombre}>{cat.nombre}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => openForm()}>
          Agregar Documento
        </Button>
      </Paper>

      <Paper elevation={2} sx={{ mb: 1.5 }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgb(2 135 209)' }}>
                <TableCell sx={{ color: '#fff' }}>Título</TableCell>
                <TableCell sx={{ color: '#fff' }}>Fecha</TableCell>
                <TableCell sx={{ color: '#fff' }}>Descripción</TableCell>
                <TableCell sx={{ color: '#fff' }}>Categoría</TableCell>
                <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.fecha}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.descripcion}</TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => { setViewUrl(item.url); setViewOpen(true); }}><VisibilityIcon /></IconButton>
                    <IconButton onClick={() => openForm(item)} sx={{ color: 'primary.main' }}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(item)}><DeleteIcon /></IconButton>
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

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Vista previa</DialogTitle>
        <DialogContent sx={{ height: '80vh', p: 0 }}>
          {viewUrl.toLowerCase().endsWith('.pdf') ? (
    // Para PDF nativo
   <object
      data={viewUrl}
      type="application/pdf"
     width="100%"
      height="100%"
    >
      <Typography>
        No se puede mostrar el PDF.{' '}
        <a href={viewUrl} target="_blank" rel="noopener noreferrer">
          Abrir en nueva pestaña
        </a>
      </Typography>
    </object>
  ) : (
    // Para Word, Excel, PPT y otros, usamos Office Online Viewer
   <iframe
      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewUrl)}`}
      width="100%"
      height="100%"
      frameBorder="0"
    />
  )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
          <Button component="a" href={viewUrl} target="_blank" rel="noopener noreferrer">Abrir original</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="md">
        <DialogTitle>{editingDoc ? 'Editar Documento' : 'Nuevo Documento'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Nombre del Documento" name="nombre" value={docForm.nombre} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Descripción" name="descripcion" value={docForm.descripcion} onChange={handleChange} fullWidth multiline rows={3} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="categoria-label">Categoría</InputLabel>
                  <Select labelId="categoria-label" name="categoriaId" value={docForm.categoriaId} onChange={handleChange} label="Categoría">
                    <MenuItem value=""><em>Seleccione</em></MenuItem>
                    {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="permiso-label">Permiso de Acceso</InputLabel>
                  <Select labelId="permiso-label" name="permisoAcceso" value={docForm.permisoAcceso} onChange={handleChange} label="Permiso de Acceso">
                    <MenuItem value={1}>Solo Usuarios Registrados</MenuItem>
                    <MenuItem value={2}>Solo Administradores</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 10 }}>
                <Button variant="contained" component="label">
                  Subir Portada
                  <input type="file" hidden accept="image/*" onChange={handleImgChange} />
                </Button>
                {!editingDoc && (
    <Button variant="contained" component="label">
      Seleccionar Archivo
      <input
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileChange}
      />
    </Button>
  )}
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {imgPreview && <Box component="img" src={imgPreview} alt="Portada" sx={{ width: 200, height: 300, objectFit: 'cover', border: '1px solid #ccc', borderRadius: 1 }} />}
                {renderFilePreview()}
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Button type="submit" variant="contained" color="secondary" startIcon={<UploadFileIcon />}>
                  {editingDoc ? 'Actualizar Documento' : 'Subir Documento'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={closeForm}>Cerrar</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
