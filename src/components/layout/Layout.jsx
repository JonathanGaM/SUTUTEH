// src/layout/Layout.jsx
import React, { useState, useEffect } from "react";
import PublicHeader from "./PublicHeader";
import AgremiadosHeader from "./AgremiadoHeader";
import AdminHeader from "./AdminHeader";
import { useLocation, Navigate } from "react-router-dom";

import PublicRoutes from "../routes/PublicRoutes";
import AgremiadosRoutes from "../routes/AgremiadosRoutes";
import AdminRoutes from "../routes/AdminRoutes";

import Footer from "./Footer";
import Error404 from "../ERROR/Error404";
import logo from "../img/logo1.jpeg";

import { Box } from "@mui/material";
import axios from "axios"; // LÍNEA AGREGADA
import { API_URL } from "../../config/apiConfig"; // LÍNEA AGREGADA

function Layout() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // LÍNEA AGREGADA
  const [authChecked, setAuthChecked] = useState(false); // LÍNEA AGREGADA
  // FUNCIÓN MODIFICADA - Solo verificar si NO estamos en rutas públicas
  useEffect(() => {
    const checkAuth = async () => {
      // ✅ SOLUCIÓN: No verificar auth en rutas públicas
      const publicPaths = [
        "/",
        "/noticias",
        "/contacto", 
        "/quienes-somos",
        "/login",           // ← CLAVE: No verificar en login
        "/registro",
        "/recuperar-contrasena"
      ];
      
      const isCurrentlyPublic = publicPaths.some(route => 
        location.pathname === route
      ) || location.pathname.startsWith('/noticias/');

      // Si estamos en ruta pública, no verificar autenticación
      if (isCurrentlyPublic) {
        setAuthChecked(true);
        return;
      }

      // Solo verificar auth si estamos en rutas protegidas
      try {
        const response = await axios.get(`${API_URL}/api/auth-check`, {
          withCredentials: true
        });
        if (response.data && response.data.user) {
          setUserRole(response.data.user.roleId);
        }
      } catch (err) {
        setUserRole(null);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [location.pathname]); // ← CLAVE: Verificar cuando cambie la ruta

  // Splash screen solo al recargar la página
  useEffect(() => {
    let isReload = false;
    if (window.performance && window.performance.navigation) {
      isReload = window.performance.navigation.type === 1;
    } else {
      const navEntries = window.performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        isReload = navEntries[0].type === "reload";
      }
    }

    if (isReload) {
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {/* Splash con logo y spinner */}
        <Box sx={{ position: "relative", width: "150px", height: "150px" }}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "-10px",
              left: "-10px",
              width: "160px",
              height: "160px",
              border: "5px solid transparent",
              borderTopColor: "green",
              borderRightColor: "green",
              borderRadius: "90%",
              animation: "spin 2s linear infinite",
            }}
          />
        </Box>
      </Box>
    );
  }

  // Rutas para cada tipo de usuario
  const agremiadosPaths = [
    "/documentos",
    "/rifas",
    "/transparencia",
    "/perfil",
    "/contacto-agremiado",
    "/reuniones",
    "/encuestas_votaciones"
  ];
  const adminPaths = [
    "/panel-admin",
    "/auditoria",
    "/datos-empresa",
    "/admin_filosofia",
    "/admin_documentos",
    "/admin_noticias",
    "/admin_preguntas",
    "/admin_encuestas",
    "/estadisticas_encuestas_votos",
    "/estadisticas_encuestas",
    "/admin_votaciones",
    "/admin_reuniones",
    "/estadistica_reuniones",
    "/comunicaciones",
    "/lista-negrayblanca",
    "/admin_rifas",
    "/admin_transparencia",
    "/admin_contribuciones",
    "/config-cuentas",
    "/estadisticas_financiera",
    "/admin_DocumentosRegulatorios",
    "/gestion-usuarios",
    "/gestion-roles",
  ];
  const publicPaths = [
    "/",
    "/noticias",
    "/contacto",
    "/quienes-somos",
    "/login",
    "/registro",
    "/recuperar-contrasena",
  ];
  

  const isAgremiadoRoute = agremiadosPaths.some((route) =>
    location.pathname.startsWith(route)
  );
  const isAdminRoute = adminPaths.some((route) =>
    location.pathname.startsWith(route)
  );
  const isPublicRoute =
  // sigue siendo true para las rutas exactas
  publicPaths.some(route => location.pathname === route)
  // y ahora también true para /noticias/lo-que-sea
  || location.pathname.startsWith('/noticias/');
    // ✅ PROTECCIÓN MEJORADA - Solo proteger cuando authChecked esté listo
  if (authChecked && !isPublicRoute) {
    // Proteger rutas de admin - Solo roleId = 2 puede acceder
    if (isAdminRoute && userRole !== 2) {
      return <Navigate to="/login" replace />;
    }
    
    // Proteger rutas de agremiados - Solo roleId = 1 puede acceder
    if (isAgremiadoRoute && userRole !== 1) {
      return <Navigate to="/login" replace />;
    }
  }


  const isValidRoute = isAdminRoute || isAgremiadoRoute || isPublicRoute;
  if (!isValidRoute) {
    return <Error404 />;
  }

  return (
    <>
      {isAdminRoute ? (
        <AdminHeader>
          <AdminRoutes />
        </AdminHeader>
      ) : isAgremiadoRoute ? (
        <>
          <AgremiadosHeader />
          {/* Ajustamos el margen superior para evitar superposición con el header */}
          <Box sx={{ marginTop: { xs: "85px", md: "100px" } }}>
            <AgremiadosRoutes />
          </Box>
        </>
      ) : (
        <>
          <PublicHeader />
          <Box sx={{ marginTop: { xs: "95px", md: "100px" } }}>
            <PublicRoutes />
          </Box>
        </>
      )}

      {/* El Footer se muestra en rutas públicas y de agremiados */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default Layout;
