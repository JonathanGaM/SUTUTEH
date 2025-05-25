// GestionUsuarios.jsx
import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const GestionUsuarios = () => {
  // Columnas para la tabla de usuarios registrados (la existente)
  const registeredColumns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "Nombre", width: 130 },
    { field: "lastNameP", headerName: "Apellido Paterno", width: 150 },
    { field: "lastNameM", headerName: "Apellido Materno", width: 150 },
    { field: "email", headerName: "Correo Electrónico", width: 200, editable: true },
    { field: "phone", headerName: "Número de Teléfono", width: 150, editable: true },
    { field: "gender", headerName: "Género", width: 120 },
    { field: "curp", headerName: "CURP", width: 200 },
    { field: "program", headerName: "Programa Educativo", width: 180, editable: true },
    { field: "position", headerName: "Puesto", width: 150, editable: true },
    { field: "university", headerName: "Universidad de Procedencia", width: 220, editable: true },
    { field: "workerNumber", headerName: "Número de Trabajador", width: 180, editable: true },
    { field: "unionNumber", headerName: "Número Sindicalizado", width: 200, editable: true },
    { field: "educationLevel", headerName: "Nivel Educativo", width: 180 },
    { field: "unionRole", headerName: "Rol en el Sindicato", width: 200 },
    {
      field: "operation",
      headerName: "Operación",
      width: 200,
      renderCell: (params) => (
        <>
          <Button variant="contained" color="warning" size="small" sx={{ mr: 1 }}>
            Bloquear
          </Button>
          <IconButton color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // Datos de ejemplo para usuarios registrados
  const initialRegisteredRows = [
    {
      id: 1,
      firstName: "Juan",
      lastNameP: "Pérez",
      lastNameM: "Gómez",
      email: "juan@example.com",
      phone: "5512345678",
      gender: "Masculino",
      curp: "JUAN123456HDFABC01",
      program: "Ingeniería",
      position: "Profesor",
      university: "UNAM",
      workerNumber: "12345",  
      unionNumber: "56789",
      educationLevel: "Maestría",
      unionRole: "Agremiado",
    },
    {
      id: 2,
      firstName: "María",
      lastNameP: "López",
      lastNameM: "Hernández",
      email: "maria@example.com",
      phone: "5523456789",
      gender: "Femenino",
      curp: "MARIA123456MDFXYZ02",
      program: "Derecho",
      position: "Administrativo",
      university: "UAM",
      workerNumber: "67890",
      unionNumber: "11223",
      educationLevel: "Licenciatura",
      unionRole: "Tesorera",
    },
  ];

  // Columnas para la nueva tabla de usuarios sin registrarse
  const unregisteredColumns = [
    { field: "id", headerName: "Número de Sindicalizado", width: 200 },
    { field: "email", headerName: "Correo", width: 250 },
    { field: "birthDate", headerName: "Fecha de Nacimiento", width: 150 },
  ];

  // Datos de ejemplo (inicialmente vacíos) para usuarios sin registrarse
  const [unregisteredRows, setUnregisteredRows] = useState([]);

  // Estado para los usuarios registrados
  const [registeredRows, setRegisteredRows] = useState(initialRegisteredRows);

  // Estados para el diálogo del formulario de agregar usuario
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    birthDate: "",
    role: "agremiado",
  });

  // Abre el diálogo
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Cierra el diálogo y resetea el formulario
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ email: "", birthDate: "", role: "agremiado" });
  };

  // Envía el formulario y agrega el nuevo usuario a la tabla de usuarios sin registrarse
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Genera un id (aquí se usa el tamaño actual + 1)
    const newId =
      unregisteredRows.length > 0
        ? Math.max(...unregisteredRows.map((row) => row.id)) + 1
        : 1;
    const newRow = {
      id: newId,
      email: formData.email,
      birthDate: formData.birthDate,
      role: formData.role, // Se almacena aunque no se muestre en la tabla
    };
    setUnregisteredRows([...unregisteredRows, newRow]);
    handleCloseDialog();
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Gestión de Usuarios
      </Typography>

      {/* Botón para agregar nuevos usuarios */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
        sx={{ mb: 2 }}
      >
        Agrega Usuarios
      </Button>

      {/* Diálogo con formulario para agregar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Agregar Usuario</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit} id="add-user-form">
            <TextField
              margin="dense"
              label="Correo"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Fecha de Nacimiento"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              margin="dense"
              label="Rol"
              select
              fullWidth
              variant="outlined"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <MenuItem value="agremiado">Agremiado</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            variant="contained"
            color="primary"
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tabla para Usuarios sin registrarse */}
      <Typography variant="h6" gutterBottom>
        Usuarios sin registrarse
      </Typography>
      <Paper sx={{ height: 300, width: "100%", overflowX: "auto", mb: 4 }}>
        <div style={{ minWidth: 600 }}>
          <DataGrid
            rows={unregisteredRows}
            columns={unregisteredColumns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        </div>
      </Paper>

      {/* Tabla para Usuarios registrados */}
      <Typography variant="h6" gutterBottom>
        Usuarios registrados
      </Typography>
      <Paper sx={{ height: 500, width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: 1500 }}>
          <DataGrid
            rows={registeredRows}
            columns={registeredColumns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        </div>
      </Paper>
    </div>
  );
};

export default GestionUsuarios;
