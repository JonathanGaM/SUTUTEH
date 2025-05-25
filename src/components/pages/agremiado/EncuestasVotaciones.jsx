// src/pages/agremiado/EncuestasVotaciones.jsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// Componente TabPanel para manejar cada pestaña
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

// Definición de las columnas usando flex para que se adapten al ancho del contenedor.
const columns = [
  { field: "title", headerName: "Título", flex: 1, minWidth: 150 },
  { field: "description", headerName: "Descripción", flex: 2, minWidth: 200 },
  { field: "closingDate", headerName: "Fecha de Cierre", flex: 1, minWidth: 150 }
];

const EncuestasVotaciones = () => {
  const [value, setValue] = useState(0);

  // Datos de ejemplo para las encuestas y votaciones contestadas
  const answeredData = [
    {
      id: 1,
      title: "Encuesta de Satisfacción Laboral",
      description: "Queremos conocer tu experiencia y propuestas para mejorar el ambiente laboral.",
      closingDate: "2023-09-30",
    },
    {
      id: 2,
      title: "Votación: Nueva Imagen Corporativa",
      description: "Elige el logo que representará a la organización el próximo año.",
      closingDate: "2023-10-05",
    },
  ];

  // Datos de ejemplo para las encuestas y votaciones no contestadas
  const unansweredData = [
    {
      id: 3,
      title: "Encuesta sobre Beneficios",
      description: "Opina sobre los beneficios actuales y qué cambios te gustaría ver.",
      closingDate: "2023-10-10",
    },
    {
      id: 4,
      title: "Votación: Elección de Delegados",
      description: "Participa en la elección de delegados para el próximo periodo.",
      closingDate: "2023-09-25",
    },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 15, mb: 4 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Encuestas y Votaciones
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

      {/* Cortinilla italiana (Tabs) */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Historial de Encuestas y Votaciones"
          variant="fullWidth"
        >
          <Tab
            label="Contestadas"
            {...a11yProps(0)}
            sx={{
              fontSize: "0.8rem",
              color: value === 0 ? "blue" : "gray",
              backgroundColor: value === 0 ? "#e3f2fd" : "transparent"
            }}
          />
          <Tab
            label="No contestadas"
            {...a11yProps(1)}
            sx={{
              fontSize: "0.8rem",
              color: value === 1 ? "red" : "gray",
              backgroundColor: value === 1 ? "#ffebee" : "transparent"
            }}
          />
        </Tabs>
      </Box>

      {/* Panel para "Contestadas" */}
      <TabPanel value={value} index={0}>
        <Paper sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={answeredData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Paper>
      </TabPanel>

      {/* Panel para "No contestadas" */}
      <TabPanel value={value} index={1}>
        <Paper sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={unansweredData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default EncuestasVotaciones;
