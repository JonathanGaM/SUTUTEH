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

import { Box } from "@mui/material";
import axios from "axios"; // LÍNEA AGREGADA
import { API_URL } from "../../config/apiConfig"; // LÍNEA AGREGADA

function Layout() {
  const location = useLocation();
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
    "/estadisticas_anual",
    "/admin_votaciones",
    "/admin_reuniones",
    "/estadistica_reuniones",
    "/admin_predicciones",  // ← NUEVA RUTA AGREGADA
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
    "/usuario",
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
