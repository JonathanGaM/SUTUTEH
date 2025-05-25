// src/pages/admin/ListasNegrayBlanca.jsx
import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from '@mui/icons-material';
import PersonIcon from "@mui/icons-material/Person";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";

// Datos de ejemplo
const blackRows = [
  { id: 1, name: "192.168.0.100", date: "2025-04-20", detail: "IP maliciosa detectada" },
  { id: 2, name: "spam.user",      date: "2025-04-18", detail: "Usuario bloqueado por spam" },
  { id: 3, name: "10.0.0.5",       date: "2025-04-17", detail: "Intento de fuerza bruta" },
];
const whiteRows = [
  { id: 1, name: "juan.perez", status: "Activo",   role: "Admin" },
  { id: 2, name: "ana.lopez",   status: "Inactivo", role: "Usuario" },
  { id: 3, name: "service.bot", status: "Activo",   role: "Servicio" },
];

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ListasNegrayBlanca() {
  const [value, setValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [blackNameSearch, setBlackNameSearch] = useState("");
  const [blackDateSearch, setBlackDateSearch] = useState("");
  const [whiteNameSearch, setWhiteNameSearch] = useState("");

  const handleChangeTab = (_, newValue) => {
    setValue(newValue);
    setPage(0);
  };
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = e => { setRowsPerPage(+e.target.value); setPage(0); };

  const filteredBlack = blackRows
    .filter(row => row.name.toLowerCase().includes(blackNameSearch.toLowerCase()))
    .filter(row => !blackDateSearch || row.date === blackDateSearch);
  const filteredWhite = whiteRows
    .filter(row => row.name.toLowerCase().includes(whiteNameSearch.toLowerCase()));

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", py: 4, px: 2, display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        <Tabs value={value} onChange={handleChangeTab} centered textColor="primary" indicatorColor="primary">
          <Tab label="Lista Negra" />
          <Tab label="Lista Blanca" />
        </Tabs>

        {/* Lista Negra */}
        <TabPanel value={value} index={0}>
          {/* Barra de búsqueda estilo Noticias */}
          <Paper sx={{ p:1.5, mb:1.5, display:'flex', gap:1.5, flexWrap:'wrap', alignItems:'center', transition:'box-shadow 0.3s', '&:hover':{boxShadow:8} }}>
            <TextField
              label="Buscar Nombre"
              value={blackNameSearch}
              onChange={e => { setBlackNameSearch(e.target.value); setPage(0); }}
              size="small"
              sx={{ flex:1 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <TextField
              label="Fecha Bloqueo"
              type="date"
              value={blackDateSearch}
              onChange={e => { setBlackDateSearch(e.target.value); setPage(0); }}
              size="small"
              InputLabelProps={{ shrink:true }}
            />
          </Paper>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'orange' }}>
                    <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Fecha Bloqueo</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Detalle</TableCell>
                    <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBlack.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, idx) => (
                      <TableRow
                        key={row.id}
                        hover
                      
                      >
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.detail}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver Perfil"><IconButton size="small"><PersonIcon /></IconButton></Tooltip>
                          <Tooltip title="Desbloquear"><IconButton size="small" color="error"><LockOpenIcon /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredBlack.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10]}
            />
          </Paper>
        </TabPanel>

        {/* Lista Blanca */}
        <TabPanel value={value} index={1}>
          {/* Barra de búsqueda estilo Noticias */}
          <Paper sx={{ p:1.5, mb:1.5, display:'flex', gap:1.5, flexWrap:'wrap', alignItems:'center', transition:'box-shadow 0.3s', '&:hover':{boxShadow:8} }}>
            <TextField
              label="Buscar Nombre"
              value={whiteNameSearch}
              onChange={e => { setWhiteNameSearch(e.target.value); setPage(0); }}
              size="small"
              sx={{ flex:1 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Paper>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'green' }}>
                    <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Estatus</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Rol</TableCell>
                    <TableCell align="center" sx={{ color: '#fff' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWhite.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, idx) => (
                      <TableRow
                        key={row.id}
                        hover
                        
                      >
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver Perfil"><IconButton size="small"><PersonIcon /></IconButton></Tooltip>
                          <Tooltip title="Bloquear"><IconButton size="small" color="error"><BlockIcon /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredWhite.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10]}
            />
          </Paper>
        </TabPanel>
      </Box>
    </Box>
  );
}
