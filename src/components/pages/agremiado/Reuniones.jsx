import React, { useState, useRef, useEffect } from "react";

import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Html5QrcodeScanner } from "html5-qrcode";
import { DataGrid } from "@mui/x-data-grid";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";


// Columnas para el DataGrid
const columns = [
  { field: "title", headerName: "Título", flex: 1, minWidth: 150 },
  { field: "description", headerName: "Descripción", flex: 2, minWidth: 250 },
  { field: "date", headerName: "Fecha", flex: 1, minWidth: 150 },
  { field: "time", headerName: "Hora", flex: 1, minWidth: 100 },
];

// Filas para el DataGrid (ejemplo)
const rows = [
  {
    id: 1,
    title: "Reunión General",
    description: "Reunión general de coordinación y estrategia.",
    date: new Date().toLocaleDateString("es-ES"),
    time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  },
  {
    id: 2,
    title: "Capacitación",
    description: "Capacitación en nuevas técnicas de gestión.",
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toLocaleDateString("es-ES"),
    time: new Date(new Date().setDate(new Date().getDate() + 2)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  },
  {
    id: 3,
    title: "Reunión de Seguimiento",
    description: "Seguimiento de avances en proyectos.",
    date: new Date(new Date().setDate(new Date().getDate() + 4)).toLocaleDateString("es-ES"),
    time: new Date(new Date().setDate(new Date().getDate() + 4)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  },
];

const Reuniones = () => {
  const scannerInstance = useRef(null);

const handleOpenScanner = () => setOpenScanner(true);
const handleCloseScanner = () => {
  setOpenScanner(false);
  scannerInstance.current?.clear().catch(console.error);
};

  // Estado para abrir/cerrar el modal del escáner QR
  const [openScanner, setOpenScanner] = useState(false);
// referencias para el escáner
const scannerId = "qr-reader";


const initScanner = () => {
  scannerInstance.current = new Html5QrcodeScanner(
    scannerId,
    { fps: 10, qrbox: 250 },
    false
  );
  scannerInstance.current.render(
    decodedText => {
      console.log("QR leído:", decodedText);
      // aquí tu lógica de registrar asistencia…
      scannerInstance.current.clear();
      setOpenScanner(false);
    },
    errorMessage => console.warn("Error QR:", errorMessage)
  );
};

useEffect(() => {
  return () => {
    if (scannerInstance.current) {
      scannerInstance.current.clear().catch(console.error);
    }
  };
}, []);

  return (
    <Container maxWidth="md" sx={{ mt: 15, mb: 4 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Reuniones
        </Typography>
        <Box
          sx={{
            height: 2,
            width: 120,
            bgcolor: "green",
            mx: "auto",
            mt: 1,
            mb: 2,
          }}
        />
      </Box>

      {/* Botón para escanear QR */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<QrCodeScannerIcon />}
          onClick={handleOpenScanner}
          sx={{ fontSize: "0.8rem" }}
        >
          Escanear QR
        </Button>
      </Box>

      {/* Historial de Reuniones (DataGrid) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Historial de Reuniones
        </Typography>
        <Paper sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>

      {/* Modal para Escáner QR */}
      <Dialog
        open={openScanner}
        onClose={handleCloseScanner}
         TransitionProps={{ onEntered: initScanner }}
        
        PaperProps={{
          sx: {
            position: "fixed",
            right: 0,
            top: "80px",
            m: 0,
            width: { xs: "100%", sm: "350px" },
            height: "calc(100% - 80px)",
            backgroundColor: "gray",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "darkgray",
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "0.8rem", color: "white" }}>
            Escáner QR
          </Typography>
          <IconButton onClick={handleCloseScanner} sx={{ p: 0, color: "white" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ backgroundColor: "gray", fontSize: "0.7rem" }}>
<div id={scannerId} style={{ width: "100%" }} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Reuniones;
