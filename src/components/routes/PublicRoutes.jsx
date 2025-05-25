   //PublicRouter.jsx
  import React from "react";
  import { Routes, Route } from "react-router-dom";
  import Home from "../pages/public/Home";
  import Noticias from "../pages/public/Noticias";
  import DetallesNoticia from "../pages/public/DetallesNoticia";
  import Contacto from "../pages/public/Contacto";
  import QuienesSomos from "../pages/public/QuienesSomos";
  import Login from "../pages/auth/Login";
  import Registro from "../pages/auth/Registro"; // Ruta para Registro
  import RecuperarContrasena from "../pages/auth/RecuperarContrasena"; // Ruta para Recuperar Contraseña

  const PublicRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noticias" element={<Noticias />} />
         <Route path="/noticias/:id" element={<DetallesNoticia />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      </Routes>
    );
  };

  export default PublicRoutes;

  