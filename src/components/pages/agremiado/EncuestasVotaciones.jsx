import React, { useState, useEffect } from "react";
import {
  Container, Typography, Box, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, TablePagination, TableSortLabel
} from "@mui/material";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

export default function EncuestasVotaciones() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");

  // Combina contestadas y activas (no contestadas)
 useEffect(() => {
  axios.get(`${API_URL}/api/encuestas-votaciones/usuario/estado`, { withCredentials: true })
    .then(({ data }) => {
      setRows(data);
    })
    .catch(console.error);
}, []);
   
  // Ordenar por estado
  const sortedRows = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.estado < b.estado) return order === "asc" ? -1 : 1;
      if (a.estado > b.estado) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, order]);

 const formatDate = (iso) => {
  if (!iso || typeof iso !== "string") return "";
  const [datePart] = iso.split("T");      // "2025-06-20"
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
};
  
  return (
    <Container maxWidth="md" sx={{ mt: 15, mb: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Encuestas y Votaciones
        </Typography>
        <Box sx={{ height: 2, width: 120, bgcolor: "green", mx: "auto", my: 1 }} />
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgb(183, 205, 239)" }}>
                <TableCell>Título</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha de Cierre</TableCell>
                <TableCell sortDirection={order}>
                  <TableSortLabel
                    active
                    direction={order}
                    onClick={() => setOrder(prev => prev === "asc" ? "desc" : "asc")}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{formatDate(r.closeDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.estado}
                        size="small"
                        color={r.estado === "Contestada" ? "primary" : "warning"}
                        sx={{ color: "white" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Container>
  );
}