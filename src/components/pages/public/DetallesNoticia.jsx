// src/pages/public/DetallesNoticia.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { API_URL } from "../../../config/apiConfig";

function ImageCarousel({ images, height = 300, interval = 12000 }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => {
    setIdx(i => (i === images.length - 1 ? 0 : i + 1));
  };

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [idx, paused, images.length, interval]);

  return (
    <Box
      sx={{ position: 'relative', width: '100%', height, overflow: 'hidden', mb: 4 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Fade key={i} in={i === idx} timeout={1000} unmountOnExit>
          <Box
            component="img"
            src={src}
            alt={`Slide ${i + 1}`}
            sx={{
              width: '100%',
              height,
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </Fade>
      ))}
    </Box>
  );
}

export default function DetallesNoticia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/noticias/${id}`)
      .then(res => {
        setNoticia(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la noticia');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Container>
    );
  }

  // Formatear fecha a "11 de Mayo de 2025"
  const dateObj = new Date(noticia.fecha_publicacion);
  const day   = dateObj.getDate();
  const month = dateObj.toLocaleString('es-ES', { month: 'long' });
  const year  = dateObj.getFullYear();
  const formattedDate = `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;

  return (
    <Container maxWidth="md" sx={{ mt: 15, mb: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>
       {/* Título */}
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
      >
        {noticia.titulo}
      </Typography>
        {/* Fecha */}
      <Typography
        variant="subtitle2"
        align="center"
        color="text.secondary"
        gutterBottom
      >
        {formattedDate}
      </Typography>

      {Array.isArray(noticia.imagenes) && noticia.imagenes.filter(Boolean).length > 0 && (
  <ImageCarousel
    images={noticia.imagenes.filter(url => url)}
    height={350}
    interval={8000}
  />
)}

    

     
    


      {/* Contenido con saltos de línea */}
      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-line', mt: 2, lineHeight: 1.6 }}
      >
        {noticia.contenido}
      </Typography>
        {/* Video asociado (contenedor más chico y centrado) */}
{noticia.url_video && (
  <Box sx={{ mt: 2, width: '100%', mx: 'auto' }}>
    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
      Video asociado:
    </Typography>
    <Box
      component="video"
      src={noticia.url_video}
      controls
      sx={{
        width: '100%',
        maxHeight: 400,
        borderRadius: 2,
        display: 'block',
        mx: 'auto'
      }}
    />
  </Box>
)}
    </Container>
  );
}