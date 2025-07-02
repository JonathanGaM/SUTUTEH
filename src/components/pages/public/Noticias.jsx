// src/pages/public/Noticias.jsx

import React, { useState, useEffect } from "react";
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
  Link,
  Snackbar,
  Alert
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import "animate.css"; // Asegúrate de tener Animate.css importado
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";



// 1) Componente de carrusel
function ImageCarousel({ images, height = 130 }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
   const next = () => {
    setIdx(i => (i === images.length - 1 ? 0 : i + 1));
  };
  const prev = () => {
    setIdx(i => (i === 0 ? images.length - 1 : i - 1));
  };
 

  useEffect(() => {
    if (paused) return;                  // si está pausado, no arrancamos el timer
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [images.length, paused]);           

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}
    onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <Box
        component="img"
        src={images[idx]}
        alt=""
        sx={{
          width: '100%',
          height,
          objectFit: 'cover',
          borderRadius: 1
        }}
      />
      {images.length > 1 && (
        <>
          <IconButton
            onClick={prev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
            }}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={next}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
            }}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
}



const Noticias = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
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
  // 1) Carga desde API
  useEffect(() => {
    axios.get(`${API_URL}/api/noticias/publicados`)
      .then(({ data }) => {
        // parsear JSON de imágenes
        const adapt = data.map(n => ({
          id:          n.id,
          title:       n.titulo,
          description: n.descripcion,
          date:        n.fecha_publicacion.split('T')[0],
          images:      JSON.parse(n.imagenes),
        }));
        setNewsList(adapt);
      })
      .catch(err => {
        console.error(err);
        setSnackbar({ open: true, message: 'Error cargando noticias', severity: 'error' });
      });
  }, []);

  // Filtrado básico de noticias (según el título o descripción)
  const filteredNews = newsList.filter(news =>
    news.title.toLowerCase().includes(search.toLowerCase()) ||
    news.description.toLowerCase().includes(search.toLowerCase())
  );

  
  // Función para "abrir" una noticia (aún no implementada)
 const handleOpenNews = (news) => {
    // navegar a /noticias/{id}
    navigate(`/noticias/${news.id}`);
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
            fontFamily: "sans-serif",
          }}
        >
          Noticias
        </Typography>
        <Box
          sx={{
            height: 2,
            width: 120,
            bgcolor: "#2e7d32",
            mx: "auto",
            mt: 1,
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {/* Columna izquierda: buscador, filtro y mini tarjetas (solo en escritorio) */}
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 1.5, textAlign: "center" }}>
            <TextField
              size="small"
              label="Buscar noticias"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#2e7d32" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "75%",
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#81c784",
                  },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#81c784",
                },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
              justifyContent: "center",
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
              "aria-labelledby": "fade-button",
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
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              maxHeight: 350,
              overflowY: "auto",
            }}
          >
            {filteredNews.map((news) => (
              <Card
                key={news.id}
                className="animate__animated animate__fadeInUp"
                sx={{
                  mb: 1.5,
                  width: "75%",
                  mx: "auto",
                  display: "flex",
                  alignItems: "center",
                  p: 0.5,
                }}
              >
                <CardActionArea onClick={() => handleOpenNews(news)}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CardMedia
                      component="img"
                      image={news.images[0]}
                      alt={news.title}
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 1,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "normal", fontSize: "0.75rem" }}
                      >
                        {news.title}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {news.date}
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Columna derecha: tarjetas de noticias principales */}
        <Grid item xs={12} md={9}>
          <Box sx={{ maxHeight: { xs: "none", md: 600 }, overflowY: "auto" }}>
            <Grid container spacing={2}>
              {filteredNews.map((news) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={news.id}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Card
                    className="animate__animated animate__fadeInUp"
                    sx={{
                      maxWidth: 320,
                      height: 335,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleOpenNews(news)}
                      sx={{ flexGrow: 1 }}
                    >
                      <ImageCarousel
                      images={news.images}
                        height={130}
                      />
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant="body2" 
                          component="div"
                          sx={{ fontSize: '0.8rem' }}
                        >
                          {news.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: "normal",
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {news.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {news.date}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleOpenNews(news)}
                      >
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

export default Noticias;