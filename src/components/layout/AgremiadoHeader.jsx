// src/components/layout/AgremiadosHeader.jsx
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
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ContactsIcon from "@mui/icons-material/Contacts"; // Para "Contacto"
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"; // Flecha hacia abajo para desktop
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"; // Flecha hacia arriba para Drawer
import CloseIcon from "@mui/icons-material/Close"; // Icono para cerrar el diálogo
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

import logo from "../img/logo1.jpeg"; // Logo del SUTUTEH
import CustomizedBreadcrumbs from "../layout/CustomizedBreadcrumbs";

// Datos de navegación, se agrega el apartado "Contacto"
const pages = [
  { label: "Actividades", path: "/actividades", icon: <HomeIcon /> },
  { label: "Documentos", path: "/documentos", icon: <DescriptionIcon /> },
  { label: "Rifas", path: "/rifas", icon: <LocalOfferIcon /> },
  { label: "Transparencia", path: "/transparencia", icon: <MonetizationOnIcon /> },
  { label: "Contacto", path: "/contacto-agremiado", icon: <ContactsIcon /> }
];

const hoverEffect = {
  transition: "0.3s",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: "scale(1.02)",
  },
};

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
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' 
        height='16' width='16' viewBox='0 0 20 20'><path fill='${encodeURIComponent(
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
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' 
      height='16' width='16' viewBox='0 0 20 20'><path fill='${encodeURIComponent(
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

const spin = keyframes`
  from {
    transform: scale(1) rotate(0deg);
  }
  to {
    transform: scale(1.2) rotate(360deg);
  }
`;

const AgremiadosLogo = styled("img")({
  marginRight: 10,
  borderRadius: "50%",
  border: "2px solid white",
  transition: "transform 0.3s ease",
  "&:hover": {
    animation: `${spin} 0.5s linear`,
  },
});

const AgremiadosTitle = styled(Typography)({
  fontWeight: 700,
  letterSpacing: ".2rem",
  textDecoration: "none",
  transition: "color 0.3s ease",
  color: "white",
  "&:hover": {
    color: "rgb(162, 162, 162)",
  },
});

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(1, 2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

function AgremiadosHeader() {
  const theme = useTheme();
  // Se considera móvil si el ancho es menor o igual a 1000px (ajustable)
  const isMobile = useMediaQuery("(max-width:1000px)");
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para el menú general (Avatar) y para el menú de Actividades (desktop)
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [activitiesAnchorEl, setActivitiesAnchorEl] = useState(null);
  // Estado para el submenú de Actividades en Drawer (móvil)
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  // Estado para el Dialog de notificaciones
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [company, setCompany] = useState(null);
  
  
  useEffect(() => {
        axios.get("http://localhost:3001/api/datos-empresa")
          .then(({ data }) => {
            if (data.length) setCompany(data[0]);
          })
          .catch(console.error);
      }, []);

  const notificationCount = 3; // Simulación de notificaciones
  const user = {
    name: "Bruno",
    img: "" // Si no hay imagen, se mostrará la primera letra del nombre
  };

  useEffect(() => {
    const pathIndex = pages.findIndex((page) => page.path === currentPath);
    setTabValue(pathIndex !== -1 ? pathIndex : 0);
  }, [currentPath]);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Maneja el click en la pestaña "Actividades" (desktop)
  const handleActivitiesClick = (event) => {
    setActivitiesAnchorEl(event.currentTarget);
  };

  const handleActivityMenuItemClick = (path) => {
    setActivitiesAnchorEl(null);
    navigate(path);
  };
   // New: Logout handler
   const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/login/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      window.location.href = '/login';
    }
  };


  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#019d3c" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", display: "flex" ,}}>
          {/* Botón de menú para móviles */}
          {isMobile && (
            <Box sx={{ display: "flex" }}>
              <IconButton onClick={() => setDrawerOpen(true)} color="inherit" sx={hoverEffect}>
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Logo y Título (solo se muestran en escritorio) */}
        

           {/* Logo y Título (sólo en escritorio) */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                component={Link}
                to="/"
                sx={{
                  p: 0,
                  width: isMobile ? 32 : 42,
                  height: isMobile ? 32 : 42,
                  borderRadius: "50%",
                 overflow: "hidden",
                 border: "1px solid white",

                  mr: 1,
                  "&:hover img": {
                    animation: `${spin} 0.5s linear`
                  }
                }}
              >
                <Box
                  component="img"
                  src={company?.avatar_url || logo}
                  alt={company?.titulo_empresa || "SUTUTEH"}
                  sx={{
                    width: "auto",
                    height: "100%",
                    objectFit: "cover",
                      transition: "transform 0.3s ease",
                  }}
                />
              </IconButton>
              <AgremiadosTitle
                variant="h6"
                noWrap
                component={Link}
                to="/"
                sx={{ fontSize: isMobile ? "1.2rem" : "1rem" }}
             >
                {company?.titulo_empresa || "SUTUTEH"}
              </AgremiadosTitle>
            </Box>
          )}

          {/* Menú de navegación (escritorio); en móvil se usa Drawer */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
              <Tabs
                value={tabValue}
                onChange={handleChangeTab}
                centered
                textColor="inherit"
                indicatorColor="primary"
                sx={{ "& .MuiTabs-indicator": { backgroundColor: "white" } }}
              >
                {pages.map((page) =>
                  page.label === "Actividades" ? (
                    <Tab
                      key={page.label}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {page.label}
                          <ArrowDropDownIcon sx={{ ml: 0.5, fontSize: "1rem" }} />
                        </Box>
                      }
                      onClick={handleActivitiesClick}
                      sx={{
                        color: "white",
                        "&.Mui-selected": { color: "white" },
                        ...hoverEffect,
                      }}
                    />
                  ) : (
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
                  )
                )}
              </Tabs>
            </Box>
          )}

          {/* Sección derecha: Notificaciones, Avatar y Switch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              color="inherit"
              sx={hoverEffect}
              onClick={() => setNotificationsOpen(true)}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={handleAvatarClick} sx={hoverEffect}>
              <Avatar
                src={user.img}
                sx={{
                  bgcolor: user.img ? "transparent" : "deepOrange.500",
                  width: 28,
                  height: 28,
                }}
              >
                {user.img ? "" : user.name.charAt(0)}
              </Avatar>
            </IconButton>
            <MaterialUISwitch defaultChecked />
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                component={Link}
                to="/perfil"
                onClick={handleCloseMenu}
                sx={{ fontSize: "0.8rem" }}
              >
                Perfil
              </MenuItem>
              <MenuItem onClick={() => { handleCloseMenu(); handleLogout(); }} sx={{ fontSize: "0.8rem" }}>Cerrar sesión</MenuItem>

            </Menu>
          </Box>
        </Toolbar>
      </Container>

      {/* Menú desplegable para Actividades (desktop) */}
      <Menu
        anchorEl={activitiesAnchorEl}
        open={Boolean(activitiesAnchorEl)}
        onClose={() => setActivitiesAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem
          onClick={() => handleActivityMenuItemClick("/reuniones")}
          sx={{ fontSize: "0.8rem" }}
        >
          Reuniones
        </MenuItem>
        <MenuItem
          onClick={() => handleActivityMenuItemClick("/encuestas_votaciones")}
          sx={{ fontSize: "0.8rem" }}
        >
          Encuestas y Votaciones
        </MenuItem>
      </Menu>

      {/* Dialog de Notificaciones */}
      <Dialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        PaperProps={{
          sx: {
            position: "fixed",
            right: 0,
            top: "64px", // Modal ligeramente más abajo
            m: 0,
            width: { xs: "100%", sm: "350px" },
            height: "calc(100% - 64px)",
            backgroundColor: "gray",
          },
        }}
      >
        <DialogTitle sx={{ p: 1, bgcolor: "darkgray", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontSize: "0.9rem", color: "white" }}>
            Notificaciones
          </Typography>
          <IconButton onClick={() => setNotificationsOpen(false)} sx={{ p: 0, color: "white" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "gray", fontSize: "0.8rem" }}>
          {[
            {
              id: 1,
              title: "Notificación 1",
              message: "Tienes un nuevo mensaje."
            },
            {
              id: 2,
              title: "Notificación 2",
              message: "Se ha actualizado tu perfil."
            },
            {
              id: 3,
              title: "Notificación 3",
              message: "Recuerda completar tu encuesta."
            }
          ].map((notif, index) => (
            <Box key={notif.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "white", fontSize: "0.8rem" }}>
                {notif.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "white", fontSize: "0.7rem" }}>
                {notif.message}
              </Typography>
              {index < 2 && (
                <Divider sx={{ bgcolor: "white", my: 1 }} />
              )}
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Fila inferior: Breadcrumbs (migas de pan) */}
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

      {/* Drawer para móviles */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 2 }}>
          <IconButton
              component={Link}
              to="/"
              onClick={() => setDrawerOpen(false)}
              sx={{
                p: 0,
                width: isMobile ? 50 : 70,
                height: isMobile ? 50 : 70,
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={company?.avatar_url || logo}
                alt={company?.titulo_empresa || "SUTUTEH"}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1, color: "#2E7D32" }}>
              {company?.titulo_empresa || "SUTUTEH"}
            </Typography>
          </Box>

          <IconButton onClick={() => setDrawerOpen(false)} sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <ChevronLeftIcon />
          </IconButton>

          <List>
            {pages.map((page) =>
              page.label === "Actividades" ? (
                <React.Fragment key={page.label}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => setActivitiesOpen((prev) => !prev)}
                      sx={hoverEffect}
                    >
                      <ListItemIcon>{page.icon}</ListItemIcon>
                      <ListItemText primary={page.label} />
                      {activitiesOpen ? (
                        <ArrowDropUpIcon fontSize="small" />
                      ) : (
                        <ArrowDropDownIcon fontSize="small" />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {activitiesOpen && (
                    <>
                      <ListItem disablePadding sx={{ pl: 4 }}>
                        <ListItemButton
                          component={Link}
                          to="/reuniones"
                          onClick={() => setDrawerOpen(false)}
                          sx={hoverEffect}
                        >
                          <ListItemText primary="Reuniones" primaryTypographyProps={{ fontSize: "0.8rem" }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ pl: 4 }}>
                        <ListItemButton
                          component={Link}
                          to="/encuestas_votaciones"
                          onClick={() => setDrawerOpen(false)}
                          sx={hoverEffect}
                        >
                          <ListItemText primary="Encuestas y Votaciones" primaryTypographyProps={{ fontSize: "0.8rem" }} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                </React.Fragment>
              ) : (
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
              )
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default AgremiadosHeader;
