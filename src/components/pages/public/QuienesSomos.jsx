// src/pages/public/QuienesSomos.jsx
import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import "animate.css"; // Importa Animate.css
import IMG_URL from "../../img/img.jpg";
import axios from "axios";



// Estructura piramidal para el Comité Ejecutivo (cargo y nombre simulado con título antes del nombre)
const pyramidComite = [
  [
    { role: "Secretaría General", name: "Ing. Juan García Martinez" }
  ],
  [
    { role: "Secretaría de Organización y Estadística", name: "Lic. María López Hernandez" },
    { role: "Secretaría de Trabajo, Conflictos, Escalafón y Promoción", name: "Doc. Carlos Hernández Ruiz" }
  ],
  [
    { role: "Secretaría de Actas y Acuerdos", name: "Maestra Ana Martínez Perez" },
    { role: "Secretaría de Finanzas", name: "Ing. Roberto Castro Gomez" },
    { role: "Secretaría de Acción Política", name: "Lic. Luisa Fernández Torres" }
  ],
  [
    { role: "Secretaría de Prensa y Propaganda", name: "Lic. José Rodríguez Cruz" },
    { role: "Secretaría de Previsión y Asistencia Social", name: "Ing. Laura Sánchez Morales" },
    { role: "Secretaría de Acción Educativa, Cultural y Deportiva", name: "Doc. Ricardo Gómez Morales" },
    { role: "Secretaría de Formación Sindical, Capacitación y Adiestramiento", name: "Maestra Sofía Pérez Rojas" }
  ]
];

// Estructura piramidal para la Comisión de Vigilancia, Honor y Justicia
const pyramidCVHJ = [
  [
    { role: "Presidente", name: "Lic. Miguel Torres Ramírez" }
  ],
  [
    { role: "Secretario", name: "Ing. Elena Morales Cruz" }
  ],
  [
    { role: "Vocal", name: "Doc. Andrés Castro Jiménez" },
    { role: "Vocal", name: "Maestra Carmen Díaz López" }
  ]
];

// Función para renderizar una estructura piramidal de objetos (versión compacta)
const renderPyramidCompact = (pyramid) => {
  return (
    <>
      {pyramid.map((row, rowIndex) => (
        <Box key={rowIndex} sx={{ mb: rowIndex < pyramid.length - 1 ? 1 : 0 }}>
          <Grid container justifyContent="center" spacing={1}>
            {row.map((item, index) => (
              <Grid item key={index}>
                <Paper
                  sx={{
                    p: 1,          // Menor padding
                    textAlign: "center",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: 2,
                    minWidth: 180, // Contenedor ligeramente más pequeño
                    fontFamily: "sans-serif"
                  }}
                >
                  <Typography variant="body2">{item.role}</Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
                    {item.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {rowIndex < pyramid.length - 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5, mb: 0.5 }}>
              <ArrowDownwardIcon fontSize="small" />
            </Box>
          )}
        </Box>
      ))}
    </>
  );
};

const QuienesSomos = () => {

   const [qs, setQs] = useState(null);

   useEffect(() => {
     axios
       .get("http://localhost:3001/api/nosotros/vigentes")
       .then(({ data }) => {
         setQs(data.find(r => r.seccion === "Quiénes Somos" && r.estado === "Vigente"));
       })
       .catch(console.error);
   }, []);


  return (
    <>
      {/* Sección: ¿Quiénes Somos? con fondo blanco (sin modificaciones en tamaño) */}
      <Box sx={{ backgroundColor: "#fff", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">
          <Grid
            container
            spacing={4}
            alignItems="flex-start"
            justifyContent="center"
            sx={{ flexDirection: { xs: "column", md: "row" } }}
          >
            {/* Sección de texto */}
            <Grid item xs={12} md={6} className="animate__animated animate__fadeInLeft">
              <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#000", fontFamily: "sans-serif" }}
                  gutterBottom
                >
                  ¿Quiénes Somos?
                </Typography>
                 <Typography variant="body2" sx={{ mt: 2, fontFamily: "sans-serif", lineHeight: 1.6 }}>
                  {qs?.contenido || "Cargando quiénes somos…"}
                </Typography>
              </Box>
            </Grid>

            {/* Sección de imagen */}
            <Grid item xs={12} md={6} className="animate__animated animate__fadeInRight">
              <Box
                component="img"
                src={qs?.img}
                alt="Imagen Quienes Somos"
                sx={{ width: "100%", height: { xs: 300, md: 400 }, boxShadow: 3, objectFit: "cover" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección: Estructura Organizacional con fondo gris claro (versión compacta) */}
      <Box sx={{ backgroundColor: "#f7f7f7", py: { xs: 3, md: 5 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "sans-serif", textAlign: "center" }}>
              Estructura Organizacional
            </Typography>
          </Box>

          {/* Pirámide para el Comité Ejecutivo */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontFamily: "sans-serif", textAlign: "center" }}>
              Comité Ejecutivo
            </Typography>
            {renderPyramidCompact(pyramidComite)}
          </Box>

          {/* Pirámide para la Comisión de Vigilancia, Honor y Justicia */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontFamily: "sans-serif", textAlign: "center" }}>
              Comisión de Vigilancia, Honor y Justicia
            </Typography>
            {renderPyramidCompact(pyramidCVHJ)}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default QuienesSomos;
