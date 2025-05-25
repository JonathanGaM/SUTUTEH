// src/pages/admin/Auditoria.jsx
import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const EVENT_TYPES = [
  { value: 'Todos', label: 'Todos' },
  { value: 'LoginFail', label: 'Login Fallido' },
  { value: 'UnauthorizedAdmin', label: 'Acceso Admin No Autorizado' },
  { value: 'UserUpdate', label: 'Modificación Usuario' },
  { value: 'Deletion', label: 'Eliminación' },
  { value: 'Other', label: 'Otros' },
];

// Datos de ejemplo
const SAMPLE_LOGS = [
  {
    id: 1,
    timestamp: '2025-04-21T08:15:30Z',
    user: 'juan.perez',
    type: 'LoginFail',
    status: 'Fallido',
    details: 'Contraseña incorrecta'
  },
  {
    id: 2,
    timestamp: '2025-04-21T09:02:10Z',
    user: 'ana.lopez',
    type: 'UnauthorizedAdmin',
    status: 'Rechazado',
    details: 'Intento de acceso a /admin/users'
  },
  {
    id: 3,
    timestamp: '2025-04-21T10:45:00Z',
    user: 'carlos.martinez',
    type: 'UserUpdate',
    status: 'Exitoso',
    details: 'Actualizó rol de pepito.gomez'
  },
  {
    id: 4,
    timestamp: '2025-04-20T14:30:20Z',
    user: 'maria.sanchez',
    type: 'Deletion',
    status: 'Exitoso',
    details: 'Eliminó noticia con ID 42'
  },
  {
    id: 5,
    timestamp: '2025-04-19T16:12:05Z',
    user: 'sistema',
    type: 'Other',
    status: 'Info',
    details: 'Se realizó backup automático'
  },
];

export default function Auditoria() {
  const [logs] = useState(SAMPLE_LOGS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    return logs
      .filter(log =>
        (filterType === 'Todos' || log.type === filterType) &&
        (`${log.user}`.toLowerCase().includes(search.toLowerCase()) ||
         `${log.details}`.toLowerCase().includes(search.toLowerCase()))
      );
  }, [logs, search, filterType]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRows = e => { setRowsPerPage(+e.target.value); setPage(0); };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Auditoría del Sistema</Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar usuario o detalle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de Evento</InputLabel>
          <Select
            value={filterType}
            label="Tipo de Evento"
            onChange={e => setFilterType(e.target.value)}
          >
            {EVENT_TYPES.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#0278D1' }}>
                <TableCell sx={{ color: '#fff' }}>Fecha / Hora</TableCell>
                <TableCell sx={{ color: '#fff' }}>Usuario</TableCell>
                <TableCell sx={{ color: '#fff' }}>Tipo</TableCell>
                <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                <TableCell sx={{ color: '#fff' }}>Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(log => (
                  <TableRow key={log.id} hover>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Chip
                        label={EVENT_TYPES.find(e => e.value === log.type)?.label || log.type}
                        size="small"
                        color={
                          log.type === 'LoginFail' ? 'error'
                          : log.type === 'UnauthorizedAdmin' ? 'warning'
                          : 'info'
                        }
                      />
                    </TableCell>
                    <TableCell>{log.status}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              }
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
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
