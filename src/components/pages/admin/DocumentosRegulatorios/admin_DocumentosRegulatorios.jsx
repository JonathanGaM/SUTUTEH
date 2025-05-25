// src/pages/admin/DocumentosRegulatorios.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography,
  Chip
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from "axios";

const sectionOptions = [
  "Políticas de Servicio",
  "Políticas de Privacidad",
  "Términos y Condiciones"
];

export default function DocumentosRegulatorios() {
  const [selectedSection, setSelectedSection] = useState("");
  const [textContent, setTextContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [versions, setVersions] = useState([]);
  const [filterSection, setFilterSection] = useState("Todos");
  const [errors, setErrors] = useState({ type: "", content: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editErrors, setEditErrors] = useState({ content: "" });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewContent, setViewContent] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const API = "http://localhost:3001/api/documentos-regulatorios";

  // Carga inicial y recargas
  const loadVersions = async () => {
    try {
      const { data } = await axios.get(API);
      setVersions(data);
    } catch (err) {
      console.error("Error fetching documentos_regulatorios:", err);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  // Crear nueva versión
  const handleSaveVersion = async () => {
    const newErr = { type: '', content: '' };
    let valid = true;
    if (!selectedSection) { newErr.type = 'Seleccione un tipo'; valid = false; }
    if (!textContent.trim()) { newErr.content = 'Ingrese contenido'; valid = false; }
    if (!valid) { setErrors(newErr); return; }

    try {
      await axios.post(API, {
        seccion: selectedSection,
        contenido: textContent
      });
      await loadVersions();
      setShowForm(false);
      setSelectedSection("");
      setTextContent("");
      setErrors({ type: "", content: "" });
      setSnackbar({ open: true, message: 'Versión guardada', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  // Abrir diálogo de edición
  const handleEditClick = id => {
    const row = versions.find(v => v.id === id);
    setEditingRowId(id);
    setEditContent(row.contenido);
    setEditErrors({ content: "" });
    setEditDialogOpen(true);
  };

  // Guardar edición de contenido
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setEditErrors({ content: 'Ingrese contenido' });
      return;
    }
    try {
      await axios.put(`${API}/${editingRowId}`, { contenido: editContent });
      await loadVersions();
      setEditDialogOpen(false);
      setEditingRowId(null);
      setSnackbar({ open: true, message: 'Contenido actualizado', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar', severity: 'error' });
    }
  };

  // Ver contenido
  const handleViewClick = id => {
    const row = versions.find(v => v.id === id);
    setViewContent(row.contenido);
    setViewDialogOpen(true);
  };

  // Eliminar versión
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API}/${toDeleteId}`);
      await loadVersions();
      setSnackbar({ open: true, message: 'Versión eliminada', severity: 'info' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
    setDeleteModalOpen(false);
  };

  // Filtrado
  const filtered = versions.filter(v =>
    filterSection === 'Todos' || v.seccion === filterSection
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Controles */}
      <Paper sx={{ p:1.5, mb:1.5, display:'flex', gap:1.5, flexWrap:'wrap', alignItems:'center' }}>
        {!showForm && <Button variant="contained" onClick={()=>setShowForm(true)}>Agregar contenido</Button>}
        <FormControl size="small" sx={{ minWidth:180 }}>
          <Select
            value={filterSection}
            onChange={e=>setFilterSection(e.target.value)}
            displayEmpty
          >
            <MenuItem value="Todos">Todos</MenuItem>
            {sectionOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Formulario nueva versión */}
      {showForm && (
        <Paper sx={{ p:2, mb:3 }} elevation={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!errors.type}>
                <Select
                  value={selectedSection}
                  onChange={e=>{ setSelectedSection(e.target.value); setErrors(prev=>({ ...prev, type:'' })); }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Seleccione tipo</MenuItem>
                  {sectionOptions.map(opt=>(
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contenido"
                multiline
                rows={4}
                fullWidth
                size="small"
                value={textContent}
                onChange={e=>{ setTextContent(e.target.value); setErrors(prev=>({ ...prev, content:'' })); }}
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>
            <Grid item xs={12} sx={{ display:'flex', justifyContent:'flex-end', gap:2 }}>
              <Button color="warning" onClick={()=>{ setShowForm(false); setErrors({type:'',content:''}); }}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleSaveVersion}>
                Guardar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabla de versiones */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor:'#1976d2' }}>
                <TableCell sx={{ color:'#fff' }}>Título</TableCell>
                <TableCell sx={{ color:'#fff' }}>Fecha Creación</TableCell>
                <TableCell sx={{ color:'#fff' }}>Versión</TableCell>
                <TableCell sx={{ color:'#fff' }}>Estado</TableCell>
                <TableCell sx={{ color:'#fff', textAlign:'center' }}>Contenido</TableCell>
                <TableCell sx={{ color:'#fff', textAlign:'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
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
                      color={row.estado==='Vigente'?'primary':'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={()=>handleViewClick(row.id)}>
                      <DescriptionIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={()=>handleEditClick(row.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={()=>{ setToDeleteId(row.id); setDeleteModalOpen(true); }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog ver */}
      <Dialog open={viewDialogOpen} onClose={()=>setViewDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ver Contenido</DialogTitle>
        <DialogContent>
        <Box
    component="div"
    sx={{ whiteSpace: 'pre-line' /* respeta saltos de línea */ }}
  >
    {viewContent}
  </Box>      </DialogContent>
        <DialogActions>
          <Button onClick={()=>setViewDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog editar */}
      <Dialog open={editDialogOpen} onClose={()=>setEditDialogOpen(false)} fullWidth maxWidth="md"
        PaperProps={{
               sx: {
                 height: '70vh',      // le da altura al 70% de la ventana
                 maxHeight: '90vh'    // tope al 90% para no desbordar
               }
             }}>
        <DialogTitle>Editar Contenido</DialogTitle>
        <DialogContent>
          <TextField
            label="Contenido"
            multiline
            rows={15}
            fullWidth
            size="small"
            value={editContent}
            onChange={e=>{ setEditContent(e.target.value); setEditErrors({ content:'' }); }}
            error={!!editErrors.content}
            helperText={editErrors.content}
            sx={{ mt:2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog open={deleteModalOpen} onClose={()=>setDeleteModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar esta versión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDeleteModalOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical:'top', horizontal:'right' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={()=>setSnackbar(prev=>({ ...prev, open:false }))}
      >
        <Alert
          onClose={()=>setSnackbar(prev=>({ ...prev, open:false }))}
          severity={snackbar.severity}
          sx={{ width:'100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
