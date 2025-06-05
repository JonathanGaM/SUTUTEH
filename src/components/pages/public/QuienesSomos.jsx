// src/pages/public/QuienesSomos.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import "animate.css"; // Para las animaciones, si las tenías antes

// ----------------------------------------------
// Transición para los diálogos tipo slide
// ----------------------------------------------
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ----------------------------------------------
// Helper para obtener las iniciales de un nombre completo
// ----------------------------------------------
const getInitials = (fullName) => {
  const parts = fullName.trim().split(" ").filter(p => p.length > 0);
  return parts.map(p => p.charAt(0)).join("").toUpperCase();
};

// ----------------------------------------------
// Dada una lista de "puestos", los agrupa en filas de longitud 1, 2, 3, ...  
// Ejemplo: si pasas 7 elementos → [[A],[B,C],[D,E,F],[G]]
// ----------------------------------------------
const buildPyramidRows = (items) => {
  const rows = [];
  let startIndex = 0;
  let nextRowSize = 1;

  while (startIndex < items.length) {
    const slice = items.slice(startIndex, startIndex + nextRowSize);
    rows.push(slice);
    startIndex += nextRowSize;
    nextRowSize += 1;
  }

  return rows;
};

// ==============================================
// Componente principal: QuienesSomos
// ==============================================
export default function QuienesSomos() {
  // --------------------------------------------------
  // 1) Datos de “Quiénes Somos” (texto e imagen)
  // --------------------------------------------------
  const [qs, setQs] = useState(null);

  // --------------------------------------------------
  // 2) Array con todos los puestos (tal como devuelve GET /api/puestos)
  //    Cada elemento tendrá, al menos:
  //      {
  //        id,
  //        nombre,
  //        responsabilidad,
  //        usuario_id,
  //        usuario_nombre,
  //        usuario_apellido_paterno,
  //        usuario_apellido_materno,
  //        usuario_url_foto
  //      }
  // --------------------------------------------------
  const [allPuestos, setAllPuestos] = useState([]);

  // --------------------------------------------------
  // 3) Para mostrar en un modal un puesto concreto (solo lectura)
  // --------------------------------------------------
  const [selectedPuesto, setSelectedPuesto] = useState(null);

  // --------------------------------------------------
  // Para responsividad (si quisieras ajustar anchos, etc.)
  // --------------------------------------------------
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // --------------------------------------------------
  // useEffect (montaje)
  //  a) Carga “Quiénes Somos”
  //  b) Carga todos los puestos
  // --------------------------------------------------
  useEffect(() => {
    // ============= A) “Quiénes Somos” =============
    axios
      .get("http://localhost:3001/api/nosotros/vigentes")
      .then(({ data }) => {
        const quien = data.find(
          (r) => r.seccion === "Quiénes Somos" && r.estado === "Vigente"
        );
        setQs(quien);
      })
      .catch((err) => {
        console.error("Error al traer Quiénes Somos:", err);
      });

    // ============= B) Todos los puestos =============
    axios
      .get("http://localhost:3001/api/puestos")
      .then(({ data }) => {
        /**
         * data es un arreglo de objetos:
         *   { 
         *      id,
         *      nombre,
         *      responsabilidad,
         *      usuario_id,
         *      usuario_nombre,
         *      usuario_apellido_paterno,
         *      usuario_apellido_materno,
         *      usuario_url_foto 
         *   }, ...
         *
         * Mapeamos cada uno a un objeto más sencillo:
         *   {
         *     puestoId: <id>,
         *     role: <nombre>,       // nombre del puesto
         *     user: null  OR {      // si está asignado, tenemos info de usuario
         *       id: usuario_id,
         *       fullName: `${usuario_nombre} ${usuario_apellido_paterno} ${usuario_apellido_materno}`,
         *       urlFoto: usuario_url_foto
         *     }
         *   }
         */
       const mapped = data.map((row) => {
  let fullName = "";
  if (row.usuario_id) {
    fullName = `${row.usuario_nombre} ${row.usuario_apellido_paterno} ${row.usuario_apellido_materno || ""}`.trim();
  }
  return {
    puestoId: row.puesto_id,          // si el backend te devuelve “puesto_id”
    role: row.puesto_nombre,          // <-- aquí cambias a “puesto_nombre”
    user: row.usuario_id
      ? {
          id: row.usuario_id,
          fullName,
          
        }
      : null,
  };
});

        setAllPuestos(mapped);
      })
      .catch((err) => {
        console.error("Error al traer puestos:", err);
      });
  }, []);

  // --------------------------------------------------
  // Para abrir/cerrar modal de detalle de un solo puesto
  // --------------------------------------------------
  const handleOpenDetalle = (puestoObj) => {
    setSelectedPuesto(puestoObj);
  };
  const handleCloseDetalle = () => {
    setSelectedPuesto(null);
  };

  // --------------------------------------------------
  // Suponemos que en la BD ya has insertado los primeros
  // X puestos que pertenecen al “Comité Ejecutivo” y luego
  // los siguientes Y puestos para la “Comisión de Vigilancia…”.
  // Aquí, por simplicidad, vamos a tomar:
  //   - Los primeros 10 índices (0..9) → Comité Ejecutivo
  //   - El resto (10..13)            → Comisión de Vigilancia, Honor y Justicia
  // Ajusta los cortes (slice) según tu número real de puestos.
  // --------------------------------------------------
  const comiteEjecutivo = allPuestos.slice(0, 10);
  const comisionVHJ = allPuestos.slice(10, 20);

  // --------------------------------------------------
  // Ahora dividimos cada grupo en “filas” piramidales:
  //   comisiónEjecutivo: filas de 1, 2, 3, 4  (total 10)
  //   comisionVHJ:       filas de 1, 1, 2     (total 4)
  // --------------------------------------------------
  const filasComite = buildPyramidRows(comiteEjecutivo);
const filasComision = [];
let start = 0;
const tamaños = [1, 1, 2, 3, 4]; // 1, 1, 2, 3, 4, … según vayas necesitando
for (let t of tamaños) {
  if (start >= comisionVHJ.length) break;
  filasComision.push(comisionVHJ.slice(start, start + t));
  start += t;
}
// Si sobra algún elemento (porque comisionVHJ.length > sum(tamaños)), lo metemos en una última fila:
if (start < comisionVHJ.length) {
  filasComision.push(comisionVHJ.slice(start));
}
  // --------------------------------------------------
  // Renderizado
  // --------------------------------------------------
  return (
    <>
      {/** ================================================= */}
      {/** Sección: ¿Quiénes Somos? (texto + imagen)           */}
      {/** ================================================= */}
      <Box sx={{ backgroundColor: "#fff", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">
          <Grid
            container
            spacing={4}
            alignItems="flex-start"
            justifyContent="center"
            sx={{ flexDirection: { xs: "column", md: "row" } }}
          >
            {/* Texto */}
            <Grid
              item
              xs={12}
              md={6}
              className="animate__animated animate__fadeInLeft"
            >
              <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: "#000",
                    fontFamily: "sans-serif",
                  }}
                  gutterBottom
                >
                  ¿Quiénes Somos?
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    fontFamily: "sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {qs?.contenido || "Cargando quiénes somos…"}
                </Typography>
              </Box>
            </Grid>

            {/* Imagen */}
            <Grid
              item
              xs={12}
              md={6}
              className="animate__animated animate__fadeInRight"
            >
              <Box
                component="img"
                src={qs?.img || "/img/img.jpg"}
                alt="Imagen Quienes Somos"
                sx={{
                  width: "100%",
                  height: { xs: 300, md: 400 },
                  boxShadow: 3,
                  objectFit: "cover",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/** ================================================= */}
      {/** Sección: Estructura Organizacional (dinámico)       */}
      {/** ================================================= */}
      <Box sx={{ backgroundColor: "#f7f7f7", py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontFamily: "sans-serif",
                textAlign: "center",
              }}
            >
              Estructura Organizacional
            </Typography>
          </Box>

          {/** -------------------- */}
          {/** 1) “Comité Ejecutivo” */}
          {/** -------------------- */}
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            Comité Ejecutivo
          </Typography>

          {filasComite.map((fila, rowIndex) => (
            <Box
              key={"comite-row-" + rowIndex}
              sx={{ mb: rowIndex < filasComite.length - 1 ? 1 : 2 }}
            >
              <Grid
                container
                justifyContent="center"
                spacing={2}
                sx={{
                  px: isSmallScreen ? 1 : 0,
                }}
              >
                {fila.map((item, idx) => {
                  // Cada “item” es { puestoId, role, user: {...} | null }
                  const fullName = item.user ? item.user.fullName : "";
                  return (
                    <Grid item key={"comite-" + rowIndex + "-" + idx}>
                      <Paper
                        sx={{
                          p: 1,
                          textAlign: "center",
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          boxShadow: 2,
                          minWidth: 160,
                          fontFamily: "sans-serif",
                        }}
                        onClick={() => handleOpenDetalle(item)}
                      >
                        {/** 1) Nombre del puesto, justo encima del Avatar */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5, // margen inferior
                          }}
                        >
                          {item.role}
                        </Typography>

                        {/** 2) Usuario asignado (avatar + nombre) */}
                        {item.user ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            
                            <Typography variant="caption">{fullName}</Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{ mt: 1, color: "#999" }}
                          >
                            Sin asignar
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {rowIndex < filasComite.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 0.5,
                    mb: 0.5,
                  }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </Box>
              )}
            </Box>
          ))}

          {/** ------------------------------------------------- */}
          {/** 2) “Comisión de Vigilancia, Honor y Justicia”     */}
          {/** ------------------------------------------------- */}
          <Typography
            variant="subtitle1"
            sx={{
              mt: 3,
              mb: 1,
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            Comisión de Vigilancia, Honor y Justicia
          </Typography>

          {filasComision.map((fila, rowIndex) => (
            <Box
              key={"comision-row-" + rowIndex}
              sx={{ mb: rowIndex < filasComision.length - 1 ? 1 : 0 }}
            >
              <Grid
                container
                justifyContent="center"
                spacing={2}
                sx={{
                  px: isSmallScreen ? 1 : 0,
                }}
              >
                {fila.map((item, idx) => {
                  const fullName = item.user ? item.user.fullName : "";
                  return (
                    <Grid item key={"comision-" + rowIndex + "-" + idx}>
                      <Paper
                        sx={{
                          p: 1,
                          textAlign: "center",
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          boxShadow: 2,
                          minWidth: 160,
                          fontFamily: "sans-serif",
                        }}
                        onClick={() => handleOpenDetalle(item)}
                      >
                        {/** Nombre del puesto */}
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {item.role}
                        </Typography>

                        {/** Usuario asignado (avatar + nombre) */}
                        {item.user ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <Typography variant="caption">{fullName}</Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{ mt: 1, color: "#999" }}
                          >
                            Sin asignar
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {rowIndex < filasComision.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 0.5,
                    mb: 0.5,
                  }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </Box>
              )}
            </Box>
          ))}
        </Container>
      </Box>

      {/** =========================================================== */}
      {/** 3) Modal de detalle de un solo puesto (solo lectura)        */}
      {/** =========================================================== */}
      
    </>
  );
}
