import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Grid, Container } from "@mui/material";
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";

import "animate.css";

import misionVisionImg from "../../img/img.jpg"; // Imagen para misión y visión

import { StyledButton } from "./StyledButton";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

// justo encima (o debajo) de `const Home = () => { … }`

const MisionVisionCarousel = ({ images, height = 320 }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 12000);
    return () => clearInterval(t);
  }, [images.length, paused]);

  return (
    <Box
      sx={{ position: "relative", width: "100%", height, borderRadius: 1, overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Box
        component="img"
        src={images[idx]}
        alt=""
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {images.length > 1 && (
        <>
          <IconButton
            size="small"
            onClick={() => setIdx(i => i === 0 ? images.length - 1 : i - 1)}
            sx={{
              position: "absolute", top: "50%", left: 8,
              transform: "translateY(-50%)",
              bgcolor: "rgba(0,0,0,0.3)", color: "white"
            }}
          >‹</IconButton>
          <IconButton
            size="small"
            onClick={() => setIdx(i => (i + 1) % images.length)}
            sx={{
              position: "absolute", top: "50%", right: 8,
              transform: "translateY(-50%)",
              bgcolor: "rgba(0,0,0,0.3)", color: "white"
            }}
          >›</IconButton>
        </>
      )}
    </Box>
  );
};

const Home = () => {
  const misionVisionRef = useRef(null);
  const valoresRef = useRef(null);
  const [misionVisionVisible, setMisionVisionVisible] = useState(false);
  const [valoresVisible, setValoresVisible] = useState(false);
  const [company, setCompany] = useState(null);
  const [nosotros, setNosotros] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/datos-empresa`)
      .then(({ data }) => {
        if (data.length) setCompany(data[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/api/nosotros/vigentes`)
  .then(({ data }) => setNosotros(data))
  .catch(console.error)
}, []);
 const mision = nosotros.find(r => r.seccion === "Misión" && r.estado === "Vigente");
const vision = nosotros.find(r => r.seccion === "Visión" && r.estado === "Vigente")
const valores = nosotros.find(r => r.seccion === "Valores" && r.estado === "Vigente");


  useEffect(() => {
    const observerOptions = { threshold: 0.3 };

    const observerMisionVision = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setMisionVisionVisible(true);
        }
      });
    }, observerOptions);

    const observerValores = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setValoresVisible(true);
        }
      });
    }, observerOptions);

    if (misionVisionRef.current) {
      observerMisionVision.observe(misionVisionRef.current);
    }
    if (valoresRef.current) {
      observerValores.observe(valoresRef.current);
    }

    return () => {
      if (misionVisionRef.current) {
        observerMisionVision.unobserve(misionVisionRef.current);
      }
      if (valoresRef.current) {
        observerValores.unobserve(valoresRef.current);
      }
    };
  }, []);
 

  return (
    <Box>
      {/* Sección Principal */}
      <Box
        sx={{
          position: "relative",
          backgroundImage: company ? `url(${company.cover_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h6"
            className="animate__animated animate__fadeInDown animate__slow"
            sx={{
              fontFamily: "Montserrat, Sans-serif",
              fontSize: "30px",
              fontWeight: 700,
              textTransform: "uppercase",
              lineHeight: "42px",
              letterSpacing: "1.8px",
              mb: 2,
              px: 16,
            }}
          >
            {company?.nombre_empresa || "Cargando..."}
          </Typography>
          <StyledButton component={Link} to="/quienes-somos" sx={{ mt: 2 }}>
            Conoce más
          </StyledButton>
        </Box>
      </Box>

      {/* Sección Misión y Visión */}
      <Box
        ref={misionVisionRef}
        sx={{
          backgroundColor: "#f5f5f5",
          py: { xs: 4, md: 5 },
          px: 6,
          opacity: misionVisionVisible ? 1 : 0,
          transform: misionVisionVisible ? "translateY(0)" : "translateY(50px)",
          transition: "all 1s ease-in-out",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontFamily: "Montserrat, Sans-serif",
                  fontSize: "24px",
                  mb: 3,
                }}
              >
                Nuestro Propósito y Futuro
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontFamily: "Montserrat, Sans-serif",
                  fontSize: "18px",
                  mb: 1,
                }}
              >
                Misión
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "Lato, Sans-serif", mb: 2 }}
              >
                {mision?.contenido || "Cargando misión…"}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontFamily: "Montserrat, Sans-serif",
                  fontSize: "18px",
                  mb: 1,
                }}
              >
                Visión
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "Lato, Sans-serif" }}
              >
                {vision?.contenido || "Cargando visión…"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
               <MisionVisionCarousel
    images={[ mision?.img, vision?.img ]}
    height={320}
  />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección valores */}
      <Box
        ref={valoresRef}
        sx={{
          backgroundColor: "#f5f5f5",
          py: { xs: 4, md: 5 },
          px: 6,
          opacity: valoresVisible ? 1 : 0,
          transform: valoresVisible ? "translateY(0)" : "translateY(50px)",
          transition: "all 1s ease-in-out",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
             {/* Imagen a la izquierda */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={valores?.img || '/ruta/fallback.jpg'}
                alt="valores"
                sx={{ width: "90%", maxHeight: "340px", objectFit: "cover" }}
              />
            </Grid>
            
            {/* Texto a la derecha */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontFamily: "Montserrat, Sans-serif",
                  fontSize: "24px",
                  mb: 3,
                }}
              >
                Nuestros Principios Fundamentales
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "Lato, Sans-serif", mb: 2 }}
              >
                {valores?.contenido || "Cargando valores…"}
              </Typography>
             
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;