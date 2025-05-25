

// src/layout/Layout.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PublicHeader from "./PublicHeader";
import AgremiadosHeader from "./AgremiadoHeader";
import AdminHeader from "./AdminHeader";

import PublicRoutes from "../routes/PublicRoutes";
import AgremiadosRoutes from "../routes/AgremiadosRoutes";
import AdminRoutes from "../routes/AdminRoutes";

import Footer from "./Footer";
import Error404 from "../ERROR/Error404";

import { Box } from "@mui/material";

function Layout() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

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
        {/* Aquí se puede colocar el logo o spinner del splash */}
        <Box>Loading...</Box>
      </Box>
    );
  }

  // Rutas para cada tipo de usuario
  const agremiadosPaths = [
    "/actividades",
    "/documentos",
    "/rifas",
    "/contribuciones",
    "/perfil",
  ];
  const adminPaths = [
    "/auditoria",
    "/datos-empresa",
    "/admin_filosofia",
    "/admin_documentos",
    "/admin_noticias",
    "/admin_preguntas",
    "/admin_encuestas",
    "/estadisticas_encuestas",
    "/admin_votaciones",
    "/comunicaciones",
    "/lista-negrayblanca",
    "/admin_rifas",
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
  const isPublicRoute = publicPaths.some(
    (route) => location.pathname === route
  );

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
          <Box sx={{ marginTop: { xs: "95px", md: "100px" } }}>
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
