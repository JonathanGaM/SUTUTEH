import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    IconButton,
    Link,
    Grid,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    
    DialogActions,
    Slide,
    Button
  } from "@mui/material";
  import CloseIcon from '@mui/icons-material/Close';
  import {
    Facebook,
    Twitter,
    Instagram,
    LocationOn,
    Email,
    Phone
  } from "@mui/icons-material";
  import LinkedInIcon from "@mui/icons-material/LinkedIn";
 import YouTubeIcon  from "@mui/icons-material/YouTube";
 import MusicNoteIcon from "@mui/icons-material/MusicNote";
  import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import logo from "../img/logo1.jpeg";
  import DownloadIcon from "@mui/icons-material/Download";
  import axios from 'axios';
  import { API_URL } from "../../config/apiConfig";

  // Ícono personalizado para Leaflet (ubicación)
  const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [25, 25],
  });

  // Animación para el diálogo
  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

 

  export default function Footer() {
    const [policies, setPolicies] = useState([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [company, setCompany] = useState(null);




    const iconMap = {
      Facebook:  { icon: <Facebook  fontSize="small" />, hover: "#1877F2" },
      Twitter:   { icon: <Twitter   fontSize="small" />, hover: "#1DA1F2" },
      Instagram: { icon: <Instagram fontSize="small" />, hover: "#C13584" },
      LinkedIn:  { icon: <LinkedInIcon  fontSize="small" />, hover: "#0077B5" },
      YouTube:   { icon: <YouTubeIcon   fontSize="small" />, hover: "#FF0000" },
      TikTok:    { icon: <MusicNoteIcon fontSize="small" />, hover: "#000000" },
    };
    

    // Cargar versiones vigentes de la API al montar

    useEffect(() => {
      axios
        .get(`${API_URL}/api/documentos-regulatorios/public`)
        .then(({ data }) => setPolicies(data))
        .catch((err) => console.error("Error fetching public policies:", err));
    }, []);
    useEffect(() => {
      axios.get(`${API_URL}/api/datos-empresa`)
        .then(({data}) => {
          if (data.length) setCompany(data[0]);
        })
        .catch(console.error);
    }, []);

    // Abrir diálogo con la política seleccionada
    const handleOpen = (seccion) => {
      const p = policies.find((x) => x.seccion === seccion);
      setSelected(p);
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
      setSelected(null);
    };

    const formatDate = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    return (
      <Box
        sx={{
          backgroundColor: "#2E332E",
          color: "white",
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2} justifyContent="center">
            {/* Primera Columna - Logo y Nombre */}

            <Grid item xs={12} sm={6} md={3} textAlign="center">
              {company && (
                <>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={1}
                    fontSize="1rem"
                  >
                    {company.titulo_empresa}
                  </Typography>
                  <Box
                    component="img"
                    src={company.avatar_url}
                    alt={company.titulo_empresa}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      border: "2px solid white",
                      mb: 1,
                    }}
                  />
                </>
              )}
            </Grid>

            {/* Segunda Columna - Políticas */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              textAlign={{ xs: "center", md: "left" }}
            >
              <Typography variant="h6" fontWeight="bold" mb={1} fontSize="1rem">
                Políticas
              </Typography>
              {policies.map((p, idx) => (
                <Typography
                  key={idx}
                  fontSize="0.85rem"
                  sx={{ mb: 1, cursor: "pointer" }}
                  onClick={() => handleOpen(p.seccion)}
                >
                  {p.seccion}
                </Typography>
              ))}
            </Grid>

            {/* Tercera Columna - Contacto */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              textAlign={{ xs: "center", md: "left" }}
            >
              <Typography variant="h6" fontWeight="bold" mb={1} fontSize="1rem">
                Contacto
              </Typography>

              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.85rem",
                  justifyContent: { xs: "center", md: "left" },
                  marginBottom: "7px",
                }}
              >
                <Phone fontSize="small" />
                {company?.telefono}
              </Typography>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.85rem",
                  justifyContent: { xs: "center", md: "left" },
                  marginBottom: "7px",
                }}
              >
                <Email fontSize="small" />
                {company?.correo}
              </Typography>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.85rem",
                  justifyContent: { xs: "center", md: "left" },
                  marginBottom: "7px",
                }}
              >
                <LocationOn fontSize="small" />
                {company?.direccion}
              </Typography>
            </Grid>

            {/* … dentro de tu Grid de "Ubicación" … */}
            <Grid item xs={12} sm={6} md={3} textAlign="center">
              <Typography variant="h6" fontWeight="bold" mb={1} fontSize="1rem">
                Ubicación
              </Typography>

              {company ? (
                <Box
                  sx={{
                    height: 150,
                    width: "100%",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <MapContainer
                    center={[company.latitud, company.longitud]}
                    zoom={15}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[company.latitud, company.longitud]}
                      icon={customIcon}
                    >
                      <Popup>
                        <Typography sx={{ fontSize: "0.60rem" }}>
                          {company.direccion}
                        </Typography>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cargando ubicación…
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Segunda Fila - Redes Sociales */}
          <Box mt={3} textAlign="center">
            <Typography variant="h6" fontWeight="bold" mb={1} fontSize="1rem">
              Síguenos en nuestras redes
            </Typography>

            <Box>
              {company?.redes.map((r, i) => {
                const cfg = iconMap[r.red_social];
                if (!cfg) return null; // oculta si no lo reconoces
                return (
                  <IconButton
                    key={i}
                    href={r.enlace}
                    target="_blank"
                    sx={{
                      color: "white",
                      mx: 0.8,
                      transition: "0.3s",
                      borderRadius: "50%",
                      width: 30,
                      height: 30,
                      "&:hover": {
                        color: cfg.hover,
                        transform: "scale(1.1)",
                        boxShadow: `0px 3px 8px ${cfg.hover}`,
                      },
                    }}
                  >
                    {cfg.icon}
                  </IconButton>
                );
              })}
            </Box>

            {/* Botón de descarga debajo de las redes sociales */}
            <Box mt={2}>
              <IconButton
                href="#"
                sx={{
                  color: "white",
                  backgroundColor: "#00C853",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#00E676",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                Descarga nuestra app
              </IconButton>
            </Box>
          </Box>

          {/* Derechos Reservados */}
          <Box
            mt={2}
            pt={1}
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.3)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" fontSize="0.8rem">
              © {new Date().getFullYear()} SUTUTEH | Todos los derechos
              reservados.
            </Typography>
          </Box>
        </Container>

        {/* Diálogo de política seleccionada */}
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {selected?.seccion}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 3, pt: 1 }}
          >
            Versión vigente: {formatDate(selected?.fecha_actualizacion)}
          </Typography>
          <DialogContent>
            <Typography
              component="div"
              variant="body2"
              sx={{ whiteSpace: "pre-line" }}
            >
              {selected?.contenido}
            </Typography>
          </DialogContent>
        </Dialog>
      </Box>
    );
  }