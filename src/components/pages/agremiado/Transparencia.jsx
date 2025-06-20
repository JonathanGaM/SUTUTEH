import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Base URL para la API de transparencia
const API_BASE = 'http://localhost:3001/api/transparencia';

export default function Transparencia() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD
  const [selected, setSelected] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar documentos y categorías en paralelo
      const [documentsRes, categoriesRes] = await Promise.all([
        axios.get(API_BASE),
        axios.get(`${API_BASE}/categorias`)
      ]);

      // Transformar datos de documentos
      const transformedItems = documentsRes.data.map(d => ({
        id: d.id,
        title: d.titulo,
        category: d.categoria,
        createdAt: d.fecha_publicacion.split('T')[0], // YYYY-MM-DD
        url: d.url
      }));

      setItems(transformedItems);
      setCategories(categoriesRes.data);
      setError('');
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los documentos de transparencia');
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = e => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Filtrado combinado usando useMemo para optimización
  const filteredData = useMemo(() =>
    items
      .filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item =>
        categoryFilter ? item.category === categoryFilter : true
      )
      .filter(item =>
        dateFilter ? item.createdAt === dateFilter : true
      )
  , [items, searchTerm, categoryFilter, dateFilter]);

  const paginated = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Función para extraer año y mes de la fecha
  const getYearMonth = (dateString) => {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.toLocaleDateString('es-ES', { month: 'long' })
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 15, mb: 15, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando documentos de transparencia...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 15 }}>
      {/* Título centrado */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Transparencia
        </Typography>
        <Box sx={{ height: 2, width: 120, bgcolor: 'green', mx: 'auto', mt: 1, mb: 2 }} />
      </Box>

      <Typography variant="body1" gutterBottom>
        Consulta y descarga de documentos de transparencia generados por el sindicato.
      </Typography>
      <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
        En este módulo encontrarás información detallada y oficial del sindicato SUTUTEH...
      </Typography>

      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper
        sx={{
          p: 2, mb: 2,
          display: 'flex', gap: 2, flexWrap: 'wrap',
          transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 8 }
        }}
        elevation={2}
      >
        <TextField
          label="Buscar por título"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            label="Categoría"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <MenuItem value=""><em>Todas</em></MenuItem>
            {categories.map(c =>
              <MenuItem key={c.id} value={c.nombre}>{c.nombre}</MenuItem>
            )}
          </Select>
        </FormControl>
        <TextField
          label="Fecha de creación"
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
      </Paper>

      {/* Tabla */}
      <Paper elevation={2} sx={{ '&:hover': { boxShadow: 10 } }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: '#fff' }}>Año</TableCell>
                <TableCell sx={{ color: '#fff' }}>Mes</TableCell>
                <TableCell sx={{ color: '#fff' }}>Categoría</TableCell>
                <TableCell sx={{ color: '#fff' }}>Título del Documento</TableCell>
                <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(row => {
                const { year, month } = getYearMonth(row.createdAt);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      transition: 'background-color 0.3s, transform 0.2s',
                      '&:hover': { bgcolor: 'action.hover', transform: 'scaleY(1.02)' }
                    }}
                  >
                    <TableCell>{year}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{month}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell align="center">
                      {/* Ver en diálogo */}
                      <IconButton
                        onClick={() => setSelected(row)}
                        sx={{ 
                          transition: 'transform 0.2s', 
                          '&:hover': { transform: 'scale(1.2)' } 
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {/* Descargar */}
                      <IconButton
                        onClick={() => window.open(row.url, '_blank')}
                        sx={{ 
                          transition: 'transform 0.2s', 
                          '&:hover': { transform: 'scale(1.2)' } 
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {filteredData.length === 0 && items.length > 0 
                      ? 'No se encontraron documentos con los filtros aplicados.'
                      : 'No hay documentos de transparencia disponibles.'
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Diálogo de previsualización */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh' }}>
          {selected?.url.toLowerCase().endsWith('.pdf') ? (
            <object 
              data={selected.url} 
              type="application/pdf" 
              width="100%" 
              height="100%"
            >
              <Typography sx={{ p: 2 }}>
                No se puede mostrar el PDF. 
                <Button 
                  component="a" 
                  href={selected.url} 
                  target="_blank" 
                  sx={{ ml: 1 }}
                >
                  Abrir en nueva pestaña
                </Button>
              </Typography>
            </object>
          ) : (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selected?.url || '')}`}
              width="100%" 
              height="100%" 
              frameBorder="0"
              title="Vista previa del documento"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cerrar</Button>
          <Button 
            component="a" 
            href={selected?.url} 
            target="_blank"
            variant="contained"
          >
            Abrir original
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}