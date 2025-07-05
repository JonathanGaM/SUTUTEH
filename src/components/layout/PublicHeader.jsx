// src/components/layout/PublicHeader.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Link, useLocation } from "react-router-dom";
import { styled, keyframes } from "@mui/material/styles";
import logo from "../img/logo1.jpeg";
import CustomizedBreadcrumbs from "../layout/CustomizedBreadcrumbs";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";


// Datos de navegación
const pages = [
  { label: "Inicio", path: "/", icon: <HomeIcon /> },
  { label: "Quiénes Somos", path: "/quienes-somos", icon: <InfoIcon /> },
  { label: "Noticias", path: "/noticias", icon: <ArticleIcon /> },
  { label: "Contacto", path: "/contacto", icon: <ContactsIcon /> }
];
const loginRoute = "/login";


// Estilos de hover para botones
const hoverEffect = {
  transition: "0.3s",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: "scale(1.02)",
  },
};
const iconHoverEffect = {
  transition: "0.3s",
  "&:hover": {
    transform: "scale(1.2)",
  },
};

// Animación para el logo
const spin = keyframes`
  from {
    transform: scale(1) rotate(0deg);
  }
  to {
    transform: scale(1.2) rotate(360deg);
  }
`;

// Logo para escritorio
const DesktopLogo = styled("img")({
  height: 40,
  marginRight: 10,
  borderRadius: "50%",
  border: "2px solid white",
  transition: "transform 0.3s ease",
  "&:hover": {
    animation: `${spin} 0.5s linear`,
  },
});
const publicTitle = styled(Typography)({
  fontWeight: 700,
  letterSpacing: ".2rem",
  textDecoration: "none",
  transition: "color 0.3s ease",
  color: "white",
  "&:hover": {
    color: "rgb(162, 162, 162)",
  },
});


// Logo para el Drawer (móviles)
const DrawerLogo = styled("img")({
  height: 70,
  borderRadius: "50%",
  border: "2px solid #2E7D32",
  transition: "transform 0.3s ease",
  "&:hover": {
    animation: `${spin} 0.5s linear`,
  },
});

// Switch personalizado (sin modificaciones)
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 28,
  padding: 6,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(5px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(18px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='16' width='16' viewBox='0 0 20 20'><path fill='${encodeURIComponent(
          "#fff"
        )}' d='M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z'/></svg>")`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 26,
    height: 26,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='16' width='16' viewBox='0 0 20 20'><path fill='${encodeURIComponent(
        "#fff"
      )}' d='M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z'/></svg>")`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 14,
  },
}));

// Contenedor para las migajas integrado en el header
const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(1, 2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

function PublicHeader() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const [tabValue, setTabValue] = React.useState(0);
  const [company, setCompany] = useState(null);

  React.useEffect(() => {
    // Mapea la URL con el índice del Tab
    const pathIndex = pages.findIndex((page) => page.path === currentPath);
    setTabValue(pathIndex !== -1 ? pathIndex : 0);
  }, [currentPath]);
    
  useEffect(() => {
       axios.get(`${API_URL}/api/datos-empresa`)
         .then(({ data }) => {
           if (data.length) setCompany(data[0]);
         })
         .catch(console.error);
     }, []);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#019d3c" }}>
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", display: "flex" }}
          >
            {/* Botón de menú para móviles */}
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                color="inherit"
                sx={hoverEffect}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo y nombre (solo en escritorio) */}
            <Box
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
             

              <IconButton
                component={Link}
                to="/"
                sx={{
                  p: 0,
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid white",
                  mr: 1, 
                  transition: "transform 0.3s ease",
                  "&:hover img": {
                    transform: "scale(1.2) rotate(360deg)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={company?.avatar_url || logo}
                  alt={company?.titulo_empresa || "SUTUTEH"}
                  sx={{
                    height: "100%",     // alto al 100% del contenedor
                    width: "auto",      // ancho auto para mantener relación de aspecto
                    objectFit: "contain",
                    transition: "transform 0.5s linear",
                  }}
                />
                
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/"
                sx={{
                  fontWeight: 700,
                  letterSpacing: ".2rem",
                  color: "white",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  "&:hover": { color: "rgb(162, 162, 162)" },
                  fontSize: { xs: "0.9rem", md: "1rem" }
                }}
              >
                {company?.titulo_empresa || "SUTUTEH"}
              </Typography>



              
            </Box>

            {/* Menú de navegación en escritorio */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleChangeTab}
                centered
                textColor="inherit"
                indicatorColor="primary"
                sx={{ "& .MuiTabs-indicator": { backgroundColor: "white" } }}
              >
                {pages.map((page) => (
                  <Tab
                    key={page.label}
                    label={page.label}
                    component={Link}
                    to={page.path}
                    sx={{
                      color: "white",
                      "&.Mui-selected": { color: "white" },
                      ...hoverEffect,
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Ícono de usuario y switch */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                component={Link}
                to={loginRoute}
                sx={{ color: "white", ...iconHoverEffect }}
              >
                <AccountCircleIcon />
              </IconButton>
              <MaterialUISwitch defaultChecked />
            </Box>
          </Toolbar>
        </Container>
        {/* Fila inferior: Breadcrumbs */}
        <BreadcrumbsContainer>
          <Box
            sx={{
              width: "100%",
              maxWidth: "1500px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            <CustomizedBreadcrumbs />
          </Box>
        </BreadcrumbsContainer>
      </AppBar>

      {/* Drawer para móviles */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 2,
            }}
          >
            <IconButton
              component={Link}
              to="/"
              onClick={() => setDrawerOpen(false)}
              sx={{ p: 0 }}
            >
              <DrawerLogo
                src={company?.avatar_url || logo}
                alt={company?.titulo_empresa || "SUTUTEH"}
              />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mt: 1, color: "#2E7D32" }}
            >
              {company?.titulo_empresa || "SUTUTEH"}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <List>
            {pages.map((page) => (
              <ListItem key={page.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={page.path}
                  onClick={() => setDrawerOpen(false)}
                  sx={hoverEffect}
                >
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default PublicHeader;