// src/routes/AgremiadosRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Documentos from "../pages/agremiado/Documentos";
import Rifas from "../pages/agremiado/Rifas";
import Transparencia from "../pages/agremiado/Transparencia";
import Perfil from "../pages/agremiado/Perfil";
import ContactoAgremiado from "../pages/agremiado/ContactoAgremiado";
import Reuniones from "../pages/agremiado/Reuniones";
import EncuestasVotaciones from "../pages/agremiado/EncuestasVotaciones";


function AgremiadosRoutes() {
  return (
    
    <Routes>
      <Route path="/reuniones" element={<Reuniones />} />
      <Route path="/encuestas_votaciones" element={<EncuestasVotaciones />} />
      <Route path="/documentos" element={<Documentos />} />
      <Route path="/rifas" element={<Rifas />} />
      <Route path="/transparencia" element={<Transparencia />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/contacto-agremiado" element={<ContactoAgremiado />} />
    </Routes>
  );
}

export default AgremiadosRoutes;

