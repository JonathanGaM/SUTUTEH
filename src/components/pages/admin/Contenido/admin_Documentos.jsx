// admin_Documentos.jsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestoreIcon from "@mui/icons-material/Restore";
import EditIcon from "@mui/icons-material/Edit";

// Componente que utiliza Google Docs Viewer para previsualizar documentos
function GoogleDocsPreview({ file }) {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      // Se limpia el blob URL cuando el componente se desmonta
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!fileUrl) return null;
  // La URL del visor de Google Docs con el blob URL del archivo
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    fileUrl
  )}&embedded=true`;

  return (
    <iframe
      src={viewerUrl}
      width="100%"
      height="600px"
      style={{ border: "none" }}
      title="Vista previa del documento"
    ></iframe>
  );
}

function Documentos() {
  const [docForm, setDocForm] = useState({
    nombre: "",
    descripcion: "",
    archivo: null,
    permisos: "Solo Usuarios Registrados"
  });

  const [documentHistory, setDocumentHistory] = useState([
    {
      id: 1,
      fecha: "2023-03-15",
      nombre: "Reglamento Interno",
      descripcion: "Documento del reglamento interno",
      autor: "Admin1",
      permisos: "Solo Usuarios Registrados",
      estado: "Activo"
    },
    {
      id: 2,
      fecha: "2023-04-01",
      nombre: "Acuerdo de Reunión",
      descripcion: "Acuerdo de la reunión del consejo",
      autor: "Admin2",
      permisos: "Solo Administradores",
      estado: "Obsoleto"
    }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocForm((prev) => ({ ...prev, archivo: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Documento enviado:", docForm);
    const newDoc = {
      id: documentHistory.length + 1,
      fecha: new Date().toISOString().split("T")[0],
      nombre: docForm.nombre,
      descripcion: docForm.descripcion,
      autor: "AdminActual",
      permisos: docForm.permisos,
      estado: "Activo"
    };
    setDocumentHistory((prev) => [...prev, newDoc]);
    setDocForm({
      nombre: "",
      descripcion: "",
      archivo: null,
      permisos: "Solo Usuarios Registrados"
    });
  };

  const columns = [
    { field: "fecha", headerName: "Fecha de Publicación", width: 150 },
    { field: "nombre", headerName: "Nombre del Documento", width: 200 },
    { field: "descripcion", headerName: "Descripción", width: 250 },
    { field: "autor", headerName: "Autor", width: 150 },
    { field: "permisos", headerName: "Permisos de Acceso", width: 200 },
    { field: "estado", headerName: "Estado", width: 120 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 180,
      renderCell: () => (
        <Box>
          <IconButton color="primary" size="small">
            <VisibilityIcon />
          </IconButton>
          <IconButton color="info" size="small">
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" size="small">
            <RestoreIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Subida y Control de Documentos
      </Typography>
      <Paper sx={{ p: 2, mb: 3, width: "100%", maxWidth: 800, mx: "auto" }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre del Documento"
                name="nombre"
                value={docForm.nombre}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción del Documento"
                name="descripcion"
                value={docForm.descripcion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" component="label">
                Seleccionar Archivo
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
              </Button>
              {docForm.archivo && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {docForm.archivo.name}
                </Typography>
              )}
            </Grid>
            {docForm.archivo && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Vista Previa:
                </Typography>
                <Box sx={{ border: "1px solid #ccc", p: 1 }}>
                  <GoogleDocsPreview file={docForm.archivo} />
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="permisos-label">Permisos de Acceso</InputLabel>
                <Select
                  labelId="permisos-label"
                  label="Permisos de Acceso"
                  name="permisos"
                  value={docForm.permisos}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Solo Usuarios Registrados">
                    Solo Usuarios Registrados
                  </MenuItem>
                  <MenuItem value="Solo Administradores">
                    Solo Administradores
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Button type="submit" variant="contained" color="primary">
                Subir Documento
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Typography variant="h6" align="center" gutterBottom>
        Historial de Documentos
      </Typography>
      <Paper
        sx={{
          height: 400,
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
          overflowX: "auto"
        }}
      >
        <div style={{ minWidth: 800, height: "100%" }}>
          <DataGrid
            rows={documentHistory}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        </div>
      </Paper>
    </Box>
  );
}

export default Documentos;
