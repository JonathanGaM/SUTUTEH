// src/pages/admin/MisionVision.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Grid,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Typography,
  Chip,
  Box
} from "@mui/material";
import { useEffect } from "react";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from "axios";

const sectionOptions = [
  "Misión",
  "Visión",
  "Valores",
  "Quiénes Somos"
];

export default function MisionVision() {
  const [selectedSection, setSelectedSection] = useState("");
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile]     = useState(null);
 const [imagePreview, setImagePreview] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [filterSection, setFilterSection] = useState("Todos");
  const [errors, setErrors] = useState({ type: "", content: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editSection, setEditSection] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editErrors, setEditErrors] = useState({ type: "", content: "" });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewContent, setViewContent] = useState("");
   const [viewImage, setViewImage] = useState(null);
   const [editImage, setEditImage] = useState(null);
const [newImageFile, setNewImageFile] = useState(null);
const [newImagePreview, setNewImagePreview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const showSnack = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnack = () => setSnackbar(prev => ({ ...prev, open: false }));

  const API = "http://localhost:3001/api/nosotros";
  const handleSectionChange = e => {
    setSelectedSection(e.target.value);
    setErrors(prev => ({ ...prev, type: '' }));
  };
  const handleTextChange = e => {
    setTextContent(e.target.value);
    setErrors(prev => ({ ...prev, content: '' }));
  };
  
  const getNextVersion = (section) => {
    const existing = records.filter(r => r.seccion === section)
    const maxVer = existing.length
      ? Math.max(...existing.map(r => parseFloat(r.version)))
      : 0;
    return (maxVer + 0.1).toFixed(1);
  };
  const handleImageChange = e => {
  const file = e.target.files[0];
  if (!file) return;
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
};


  useEffect(() => {
    axios.get(API)
      .then(({ data }) => setRecords(data))
      .catch(err => console.error("Error fetching nosotros:", err));
  }, []);

  const handleSaveRecord = async () => {
    const errs = { type: '', content: '' };
    let valid = true;
    if (!selectedSection) { errs.type = 'Seleccione un tipo'; valid = false; }
    if (!textContent.trim()) { errs.content = 'Ingrese contenido'; valid = false; }
    if (!valid) { setErrors(errs); return; }

    
            // montamos un FormData para enviar binario
     const formData = new FormData();
     formData.append('seccion', selectedSection);
     formData.append('version', getNextVersion(selectedSection));
     formData.append('contenido', textContent);
     if (imageFile) {
       formData.append('img', imageFile);
     }
     await axios.post(API, formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
     });
            // 3) recargar lista
            const { data } = await axios.get(API);
            setRecords(data);
            showSnack("Registro guardado", "success");
            setShowForm(false);
            setSelectedSection("");
            setTextContent("");
           setImageFile(null);
     setImagePreview(null);
          
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedSection('');
    setTextContent('');
    setErrors({ type: '', content: '' });
    setImageFile(null);
    setImagePreview(null);
  };
  const handleEditClick = id => {
    const rec = records.find(r => r.id === id);
    setEditingId(id);
    setEditSection(rec.seccion);    // <-- aquí le pasas rec.seccion
    setEditContent(rec.contenido);
     setEditImage(rec.img);
    setNewImagePreview(rec.img);
    setNewImageFile(null);
    setEditDialogOpen(true);
  };
  const handleEditContentChange = e => setEditContent(e.target.value);
 
  const handleSaveEdit = async () => {
        const errs = { type: '', content: '' };
        if (!editContent.trim()) {
          errs.content = 'Ingrese contenido';
          setEditErrors(errs);
          return;
        }
    
        try {
         
    // 1) Preparamos FormData y añadimos la imagen si hay
      const formData = new FormData();
      formData.append('contenido', editContent);
      if (newImageFile) {
        formData.append('img', newImageFile);
      }
      // 2) Llamada al backend con multipart/form-data
      await axios.put(`${API}/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
          // 2) Recargar toda la lista
          const { data } = await axios.get(API);
          setRecords(data);
    
          showSnack('Contenido actualizado correctamente', 'success');
          setEditDialogOpen(false);
          setEditingId(null);
        } catch (err) {
          console.error('Error al actualizar:', err);
          showSnack('Error al actualizar contenido', 'error');
        }
      };



  const handleCancelEdit = () => { setEditDialogOpen(false); setEditingId(null); };

  const handleViewClick = id => {
    const rec = records.find(r => r.id === id);
    setViewContent(rec.contenido);
    setViewImage(rec.img);  
    setViewDialogOpen(true);
  };

  const handleDeleteClick = id => { setToDeleteId(id); setDeleteDialogOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API}/${toDeleteId}`);
      // recarga la lista desde el servidor
      const { data } = await axios.get(API);
      setRecords(data);
      showSnack("Versión eliminada", "info");
    } catch (err) {
      console.error("Error al eliminar:", err);
      showSnack("Error al eliminar", "error");
    }
    setDeleteDialogOpen(false);
  };

  
  const handleCancelDelete = () => setDeleteDialogOpen(false);

  const filtered = records.filter(r => filterSection === 'Todos' || r.seccion  === filterSection);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Controls */}
      <Paper
        sx={{
          p: 1.5,
          mb: 1.5,
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
          "&:hover": { boxShadow: 8 },
        }}
      >
        {!showForm && (
          <Button variant="contained" onClick={() => setShowForm(true)}>
            Agregar contenido
          </Button>
        )}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            displayEmpty
          >
            <MenuItem value="Todos">Todos</MenuItem>
            {sectionOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Form new version */}
      {showForm && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <FormControl fullWidth size="small" error={!!errors.type}>
                <Select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Seleccione tipo
                  </MenuItem>
                  {sectionOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Contenido"
                multiline
                rows={4}
                fullWidth
                size="small"
                value={textContent}
                onChange={handleTextChange}
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Button variant="outlined" component="label" size="small">
                  Seleccionar imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Vista previa"
                    sx={{
                      width: "100%", // ocupa ancho completo
                      height: "auto", // mantiene proporción
                      maxHeight: 250,
                      display: "block",
                      objectFit: "contain",
                      mt: 1,
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
            >
              <Button color="warning" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleSaveRecord}>
                Guardar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Versions table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "#fff" }}>Título</TableCell>
                <TableCell sx={{ color: "#fff" }}>Fecha Creación</TableCell>
                <TableCell sx={{ color: "#fff" }}>Versión</TableCell>
                <TableCell sx={{ color: "#fff" }}>Estado</TableCell>
                <TableCell sx={{ color: "#fff", textAlign: "center" }}>
                  Contenido
                </TableCell>
                <TableCell sx={{ color: "#fff", textAlign: "center" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.seccion}</TableCell>
                  <TableCell>
                    {new Date(row.fecha_creacion).toLocaleDateString()}
                  </TableCell>

                  <TableCell>{row.version}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.estado}
                      size="small"
                      color={row.estado === "Vigente" ? "primary" : "error"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(row.id)}
                    >
                      <DescriptionIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(row.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ver Contenido</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography>{viewContent}</Typography>
          </Box>
          {viewImage && (
           <Box
             component="img"
             src={viewImage}
             alt="Imagen sección"
             sx={{
               width: "100%",
               height: "auto",
               maxHeight: 250,
               objectFit: "contain",
               mb: 2,
               borderRadius: 1,
             }}
           />
         )}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Versión</DialogTitle>
        <DialogContent>
          
          <TextField
            label="Sección"
            value={editSection}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              mt: 2,
              // pon el texto en negrita
              "& .MuiInputBase-input.Mui-readOnly": {
                fontWeight: "500",
              },
            }}
          />
          <TextField
            label="Contenido"
            multiline
            rows={4}
            fullWidth
            size="small"
            value={editContent}
            onChange={handleEditContentChange}
            error={!!editErrors.content}
            helperText={editErrors.content}
            sx={{ mt: 2 ,mb: 2}}
          />

          {(newImagePreview || editImage) && (
          <Box
            component="img"
            src={newImagePreview || editImage}
            alt="Imagen sección"
            sx={{
             display: 'block',         // para que respete márgenes laterales
      width: 'auto',            // tamaño natural o al máximo que quieras
      maxWidth: '100%',         // nunca exceda el contenedor
      height: 'auto',
      maxHeight: 200,
      objectFit: 'contain',
      mb: 2,
      borderRadius: 1,
      ml: 0,                    // margen izquierdo cero
      mr: 'auto' 
            }}
          />
        )}
        <Button variant="outlined" component="label" size="small" sx={{ mb: 2 }}>
          Cambiar imagen
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              setNewImageFile(file);
              setNewImagePreview(URL.createObjectURL(file));
            }}
          />
        </Button>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar esta versión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={closeSnack}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}