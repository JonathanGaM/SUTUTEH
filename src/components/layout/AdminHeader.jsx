import React, { useState, useEffect } from "react";

import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

// Importación de iconos para cada módulo principal
import DashboardIcon from '@mui/icons-material/Dashboard'; // NUEVO ICONO PARA DASHBOARD
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PolicyIcon from '@mui/icons-material/Policy';
import GroupIcon from '@mui/icons-material/Group';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessIcon from '@mui/icons-material/Business';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import ArticleIcon from '@mui/icons-material/Article';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SettingsIcon from '@mui/icons-material/Settings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import axios from "axios";

import { API_URL } from "../../config/apiConfig";
import CustomizedBreadcrumbs from "../layout/CustomizedBreadcrumbs";


// Logo que se muestra en el Drawer

// Definición del MaterialUISwitch personalizado
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
        backgroundImage: `url("data:image/svg+xml;utf8,<svg 
          xmlns='http://www.w3.org/2000/svg' height='16' width='16' 
          viewBox='0 0 20 20'><path fill='${encodeURIComponent(
            "#fff"
          )}' d='M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5
          l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 
          11-6.6-6.6 5.8 5.8 0 006.6 6.6z'/></svg>")`,
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
      backgroundImage: `url("data:image/svg+xml;utf8,<svg 
        xmlns='http://www.w3.org/2000/svg' height='16' width='16' 
        viewBox='0 0 20 20'><path fill='${encodeURIComponent(
          "#fff"
        )}' d='M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 
        1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 
        0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 
        5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 
        0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 
        0010 5.139zm0 1.389A3.462 3.462 0 0113.471 
        10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 
        016.527 10 3.462 3.462 0 0110 6.528zM1.665 
        9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 
        13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 
        0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 
        16.25v2.083h1.389V16.25h-1.39z'/></svg>")`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 14,
  },
}));

const drawerWidth = 240;

// Mantiene la lógica de mostrar/ocultar el contenido
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

// AppBar superior
const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    backgroundColor: "#3f5873", // Color del Header
  })
);

// DrawerHeader con altura reducida
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  // Eliminamos theme.mixins.toolbar y establecemos una altura más baja
  height: 45,
  padding: theme.spacing(0, 1),
}));
// 2. AGREGAR este styled component después de DrawerHeader:
const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(1, 2),
  display: "flex",
  justifyContent: "flex-start", // Alineado a la izquierda para admin
  alignItems: "center",
  borderBottom: "1px solid #e0e0e0", // Línea sutil para separar
}));

// Estructura del menú
const menuItems = [
  // NUEVO ITEM PARA DASHBOARD PRINCIPAL
  {
    title: "DASHBOARD",
    icon: <DashboardIcon />,
    path: "/panel-admin", // Ruta directa sin subItems
    isMain: true // Marcador especial para identificar el dashboard principal
  },
  {
    title: "PERFIL DE EMPRESA",
    icon: <AccountCircleIcon />,
    subItems: [
      { title: "Datos de Empresa", path: "/datos-empresa", icon: <BusinessIcon /> },
      { title: "Filosofía Empresarial", path: "/admin_filosofia", icon: <InfoIcon /> },
     
    ]
  },
  {
    title: "CONTENIDO",
    icon: <DescriptionIcon />,
    subItems: [
      { title: "Documentos", path: "/admin_documentos", icon: <DescriptionIcon /> },
      { title: "Noticias", path: "/admin_noticias", icon: <ArticleIcon /> },
      { title: "Preguntas", path: "/admin_preguntas", icon: <QuestionAnswerIcon /> },
    ]
  },
  {
    title: "ENCUESTAS Y VOTACIONES",
    icon: <HowToVoteIcon />,
    subItems: [
      { title: "Encuestas", path: "/admin_encuestas", icon: <HowToVoteIcon /> },
      { title: "Estadísticas", path: "/estadisticas_anual", icon: <AssessmentIcon /> },
      { title: "Votaciones", path: "/admin_votaciones", icon: <HowToVoteIcon /> },
      { title: "Reuniones", path: "/admin_reuniones", icon: <HowToVoteIcon /> },
    ]
  },
  {
    title: "COMUNICACION",
    icon: <NotificationsIcon />,
    subItems: [
      { title: "Notificaciones Automáticas", path: "/comunicaciones", icon: <NotificationsIcon /> },
      //un chat bot
    ]
  },
  {
    title: "MONITOREO DE INCIDENCIAS",
    icon: <ListAltIcon />,
    subItems: [
      { title: "Lista Negra y Blanca", path: "/lista-negrayblanca", icon: <ListAltIcon /> },
      { title: "Auditoría", path: "/auditoria", icon: <GavelIcon /> },
    ]
  },
  {
    title: "GESTIÓN FINANCIERA",
    icon: <MonetizationOnIcon />,
    subItems: [

      { title: "Rifas", path: "/admin_rifas", icon: <CardGiftcardIcon /> },
      { title: "Transparencia", path: "/admin_transparencia", icon: <CardGiftcardIcon /> },
      { title: "Contribuciones", path: "/admin_contribuciones", icon: <MonetizationOnIcon /> },
      { title: "Configuración de Cuentas", path: "/config-cuentas", icon: <SettingsIcon /> },
      { title: "Estadísticas Financieras", path: "/estadisticas_financiera", icon: <AssessmentIcon /> },
    ]
  },
  {
    title: "MARCO LEGAL",
    icon: <PolicyIcon />,
    subItems: [
      { title: "Documentos regulatorios", path: "/admin_DocumentosRegulatorios", icon: <GavelIcon /> },
     
    ]
  },
  {
    title: "GESTIÓN DE USUARIOS",
    icon: <GroupIcon />,
    subItems: [
      { title: "Usuarios", path: "/gestion-usuarios", icon: <SupervisorAccountIcon /> },
      { title: "Comité Ejecutivo", path: "/gestion-roles", icon: <SupervisorAccountIcon /> },
    ]
  },
];


export default function AdminHeader({ children }) {
  const theme = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [switchChecked, setSwitchChecked] = React.useState(true);
  const [expandedMenus, setExpandedMenus] = React.useState({});
  const [company, setCompany] = useState(null);

  useEffect(() => {
      axios
         .get(`${API_URL}/api/datos-empresa`)
         .then(({ data }) => {
           if (data.length) setCompany(data[0]);
         })
         .catch(console.error);
       }, []);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSwitchChange = (event) => {
    setSwitchChecked(event.target.checked);
  };

  const toggleMenu = (title) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

 const handleLogout = async () => {
  try {
    await axios.post(`${API_URL}/api/login/logout`, {}, { withCredentials: true });
  } catch (err) {
    console.error('Error en logout:', err);
  } finally {
    window.location.href = '/login';
  }
};

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="fixed" open={drawerOpen}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!drawerOpen && (
              <IconButton
                color="inherit"
                aria-label="abrir menú"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/panel-admin" // CAMBIADO: Ahora el título lleva al dashboard
              sx={{
                fontWeight: 700,
                letterSpacing: ".2rem",
                color: "white",
                textDecoration: "none",
              }}
            >
              Panel Administrativo
            </Typography>
          </Box>
          <Box>
            <MaterialUISwitch
              checked={switchChecked}
              onChange={handleSwitchChange}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f7f8f8",
            color: "#424242",
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon sx={{ color: "#424242" }} />
            ) : (
              <ChevronRightIcon sx={{ color: "#424242" }} />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider />

        {/* Logo y Título "SUTUTEH" en la parte superior del Drawer */}
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Box
            component="img"
            src={company?.avatar_url}
            alt={company?.titulo_empresa || "SUTUTEH "}
            sx={{
              height: 100,
              width: 100,
              borderRadius: "50%",
              border: "2px solid #ccc",
              mb: 1,
              objectFit: "cover",
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: "#424242" }}
          >
            {company?.titulo_empresa || "SUTUTEH"}
          </Typography>
        </Box>

        <Divider />

        <List>
          {menuItems.map((module) => (
            <React.Fragment key={module.title}>
              {/* NUEVO: Manejo especial para el dashboard principal */}
              {module.isMain ? (
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to={module.path}
                    sx={{
                      backgroundColor: location.pathname === module.path ? "#e3f2fd" : "inherit",
                      borderLeft: location.pathname === module.path ? "4px solid #424242" : "none",
                      transition: "background-color 0.3s, transform 0.3s",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#424242" }}>
                      {module.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={module.title}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "#424242",
                        fontWeight: location.pathname === module.path ? "bold" : "normal",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ) : (
                // Manejo normal para módulos con subItems
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => toggleMenu(module.title)}
                    sx={{
                      backgroundColor: module.subItems?.some(
                        (sub) => sub.path === location.pathname
                      )
                        ? "#e3f2fd"
                        : "inherit",
                      borderLeft: module.subItems?.some(
                        (sub) => sub.path === location.pathname
                      )
                        ? "4px solid #424242"
                        : "none",
                      transition: "background-color 0.3s, transform 0.3s",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#424242" }}>
                      {module.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={module.title}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "#424242",
                      }}
                    />
                    {expandedMenus[module.title] ? (
                      <ExpandLess sx={{ color: "#424242" }} />
                    ) : (
                      <ExpandMore sx={{ color: "#424242" }} />
                    )}
                  </ListItemButton>
                </ListItem>
              )}
              
              {/* Submenu items (solo para módulos que no sean main) */}
              {!module.isMain && expandedMenus[module.title] &&
                module.subItems &&
                module.subItems.map((sub) => {
                  const subActive = sub.path === location.pathname;
                  return (
                    <ListItem key={sub.title} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={sub.path}
                        sx={{
                          pl: 4,
                          backgroundColor: subActive ? "#e3f2fd" : "inherit",
                          borderLeft: subActive ? "4px solid #424242" : "none",
                          transition: "background-color 0.3s, transform 0.3s",
                          "&:hover": {
                            backgroundColor: "#e3f2fd",
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={sub.title}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "#424242",
                            textTransform: "none",
                            textAlign: "left",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              <Divider />
            </React.Fragment>
          ))}

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                transition: "background-color 0.3s, transform 0.3s",
                "&:hover": {
                  backgroundColor: "rgba(255,0,0,0.2)",
                  transform: "scale(1.02)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "red" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar sesión"
                primaryTypographyProps={{ variant: "body2", color: "red" }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Main open={drawerOpen}>
        <DrawerHeader />
              {/* AGREGAR ESTA SECCIÓN */}
  <BreadcrumbsContainer>
    <Box sx={{ 
      width: "100%", 
      textAlign: "left" 
    }}>
      <CustomizedBreadcrumbs />
    </Box>
  </BreadcrumbsContainer>
        {children}
  
      </Main>
    </Box>
  );
}