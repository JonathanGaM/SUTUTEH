import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Menu,
  MenuItem,
  Fade,
  Snackbar,
  Alert
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import "animate.css"; // Asegúrate de tener Animate.css importado

// Datos de ejemplo para documentos
const dummyDocs = [
  {
    id: 1,
    title: "Manual de usuario",
    description: "Guía para el uso del sistema de documentación.",
    date: "2023-09-15",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 2,
    title: "Reglamento interno",
    description: "Documento que regula las políticas internas de la organización.",
    date: "2023-09-14",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 3,
    title: "Informe anual",
    description: "Resumen de las actividades del último año.",
    date: "2023-09-13",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 4,
    title: "Política de privacidad",
    description: "Normas para la protección de datos y privacidad.",
    date: "2023-09-12",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 5,
    title: "Acta de asamblea",
    description: "Registro de la última asamblea general de la organización.",
    date: "2023-09-11",
    image: "https://via.placeholder.com/300x200"
  }
];

const Documentos = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Más reciente");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Estados para el menú de filtro
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  // Opciones de filtro
  const filterOptions = ["Más reciente", "Última semana", "Último mes"];

  const handleFilterSelect = (option) => {
    setFilter(option);
    setAnchorEl(null);
    setSnackbar({
      open: true,
      message: `Filtrando por: ${option}`,
      severity: "info"
    });
  };

  // Filtrado básico de documentos (según el título o descripción)
  const filteredDocs = dummyDocs.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.description.toLowerCase().includes(search.toLowerCase())
  );

  // Función para "abrir" un documento (aún no implementada)
  const handleOpenDoc = (doc) => {
    console.log("Abriendo documento:", doc.title);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 6 }}>
      {/* Título principal */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#000",
            fontFamily: "sans-serif"
          }}
        >
          Documentos
        </Typography>
        <Box
          sx={{
            height: 2,
            width: 120,
            bgcolor: "#2e7d32",
            mx: "auto",
            mt: 1
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {/* Columna izquierda: buscador, filtro y mini tarjetas (solo en escritorio) */}
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 1.5, textAlign: "center" }}>
            <TextField
              size="small"
              label="Buscar documentos"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#2e7d32" }} />
                  </InputAdornment>
                )
              }}
              sx={{
                width: "75%",
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#81c784"
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#81c784"
                }
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
              justifyContent: "center"
            }}
          >
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon sx={{ color: "#2e7d32" }} />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#2e7d32" }}>
              {filter}
            </Typography>
          </Box>

          {/* Menú desplegable para filtrar */}
          <Menu
            id="fade-menu"
            MenuListProps={{
              "aria-labelledby": "fade-button"
            }}
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleFilterClose}
            TransitionComponent={Fade}
          >
            {filterOptions.map((option) => (
              <MenuItem key={option} onClick={() => handleFilterSelect(option)}>
                {option}
              </MenuItem>
            ))}
          </Menu>

          {/* Mini tarjetas: se muestran solo en escritorio */}
          <Box sx={{ display: { xs: "none", md: "block" }, maxHeight: 350, overflowY: "auto" }}>
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="animate__animated animate__fadeInUp"
                sx={{
                  mb: 1.5,
                  width: "75%",
                  mx: "auto",
                  display: "flex",
                  alignItems: "center",
                  p: 0.5
                }}
              >
                <CardActionArea onClick={() => handleOpenDoc(doc)}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CardMedia
                      component="img"
                      image={doc.image}
                      alt={doc.title}
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 1,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "scale(1.05)"
                        }
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.date}
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Columna derecha: tarjetas principales de documentos */}
        <Grid item xs={12} md={9}>
          <Box sx={{ maxHeight: { xs: "none", md: 600 }, overflowY: "auto" }}>
            <Grid container spacing={2}>
              {filteredDocs.map((doc) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={doc.id}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" }
                  }}
                >
                  <Card
                    className="animate__animated animate__fadeInUp"
                    sx={{
                      maxWidth: 320,
                      height: 330,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      width: "100%"
                    }}
                  >
                    <CardActionArea onClick={() => handleOpenDoc(doc)} sx={{ flexGrow: 1 }}>
                      <CardMedia
                        component="img"
                        height="130"
                        image={doc.image}
                        alt={doc.title}
                        sx={{
                          transition: "transform 0.3s",
                          "&:hover": {
                            transform: "scale(1.05)"
                          }
                        }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="subtitle2" component="div">
                          {doc.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doc.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {doc.date}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="small" color="success" onClick={() => handleOpenDoc(doc)}>
                        Ver más
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: 250 }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Documentos;
