import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';

// Mock data
const transparencyData = [
  { id: 1, year: 2025, month: 'Enero', category: 'Financiera', title: 'Informe Financiero Enero 2025', file: '/docs/finanzas-ene-2025.pdf' },
  { id: 2, year: 2025, month: 'Febrero', category: 'Actas', title: 'Acta Asamblea Febrero 2025', file: '/docs/acta-feb-2025.pdf' },
  { id: 3, year: 2025, month: 'Marzo', category: 'Presupuestos', title: 'Presupuesto 2025', file: '/docs/presupuesto-2025.pdf' },
  // ... más registros
];

export default function Transparencia() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredData = transparencyData
    .filter((row) => row.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((row) => (categoryFilter ? row.category === categoryFilter : true));

  const paginated = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 15  }}>
      {/* Encabezado centrado con línea verde */}
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
        En este módulo encontrarás información detallada y oficial del sindicato SUTUTEH, como estados financieros, actas de asambleas, presupuestos y reportes mensuales. Nuestro objetivo es garantizar la transparencia y acceso a la gestión de recursos, fortaleciendo la confianza de cada agremiado.
      </Typography>

      <Paper
        sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 8 } }}
        elevation={2}
      >
        <TextField
          label="Buscar por título"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Categoría</InputLabel>
          <Select label="Categoría" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Financiera">Financiera</MenuItem>
            <MenuItem value="Actas">Actas</MenuItem>
            <MenuItem value="Presupuestos">Presupuestos</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={2} sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 10 } }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Año</TableCell>
                <TableCell>Mes</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Título del Documento</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ transition: 'background-color 0.3s, transform 0.2s', '&:hover': { bgcolor: 'action.hover', transform: 'scaleY(1.02)' } }}
                >
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => window.open(row.file, '_blank')}
                      sx={{ transition: 'transform 0.2s, color 0.3s', '&:hover': { transform: 'scale(1.2)', color: 'primary.dark' } }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron documentos.
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
        />
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent>
          <embed src={selected?.file} type="application/pdf" width="100%" height="600px" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
