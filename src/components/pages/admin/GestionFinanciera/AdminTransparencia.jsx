// src/pages/admin/AdminTransparencia.jsx
import React, { useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link as MuiLink
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import LinkIcon from '@mui/icons-material/Link';

export default function AdminTransparencia() {
  // State for transparency records
  const [records, setRecords] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '' });

  // Handlers
  const openForm = (rec = null) => {
    if (rec) {
      setEditingId(rec.id);
      setFormData({ title: rec.title, url: rec.url });
    } else {
      setEditingId(null);
      setFormData({ title: '', url: '' });
    }
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSave = () => {
    if (!formData.title || !formData.url) return;
    if (editingId) {
      setRecords(prev => prev.map(r =>
        r.id === editingId ? { ...r, ...formData } : r
      ));
    } else {
      setRecords(prev => [{ id: Date.now(), ...formData }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = id => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => openForm()}>
          Agregar Documento
        </Button>
      </Paper>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Enlace</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(rec => (
                <TableRow key={rec.id} hover>
                  <TableCell>{rec.title}</TableCell>
                  <TableCell>
                    <MuiLink href={rec.url} target="_blank" rel="noopener">
                      <LinkIcon fontSize="small" />
                    </MuiLink>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openForm(rec)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(rec.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for add/edit */}
      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Editar Documento' : 'Nuevo Documento'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Nombre"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar placeholder (if needed) */}
      {/* <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar> */}
    </Container>
  );
}
