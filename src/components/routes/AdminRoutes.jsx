// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PanelAdmin from '../pages/admin/panelAdmin';

import Auditoria from '../pages/admin/MonitoreoIncidencias/Auditoria';
import DatosdeEmpresa from '../pages/admin/PerfilEmpresa/DatosdeEmpresa';
import Filosofia from '../pages/admin/PerfilEmpresa/admin_filosofia';

import Documentos from '../pages/admin/Contenido/admin_Documentos';
import Noticias from '../pages/admin/Contenido/admin_Noticias';
import Preguntas from '../pages/admin/Contenido/admin_Preguntas';
import Encuestas from '../pages/admin/EncuestasyVotaciones/admin_encuestas';
import Estadisticas from '../pages/admin/EncuestasyVotaciones/Estadisticas';
import Votaciones from '../pages/admin/EncuestasyVotaciones/admin_votaciones';
import Reuniones from '../pages/admin/EncuestasyVotaciones/admin_reuniones';
import Predicciones from '../pages/admin/EncuestasyVotaciones/admin_Predicciones'; // ← NUEVA IMPORTACIÓN
import NotificacionesAutomatica from '../pages/admin/Comunicaciones/NotificacionesAutomatica';
import ListasNegrayBlanca from '../pages/admin/MonitoreoIncidencias/ListasNegrayBlanca';
import Rifas from '../pages/admin/GestionFinanciera/admin_Rifas';
import Contribuciones from '../pages/admin/GestionFinanciera/admin_Contribuciones';
import ConfigCuentas from '../pages/admin/GestionFinanciera/configuracionDeCuentas';
import EstadisticasFin from '../pages/admin/GestionFinanciera/Estadisticas';
import Transparencia from '../pages/admin/GestionFinanciera/AdminTransparencia';

import DocumentosRegulatorios from '../pages/admin/DocumentosRegulatorios/admin_DocumentosRegulatorios';

import GestionUsuarios from '../pages/admin/GestionUsuarios/GestionUsuarios';
import Usuario from '../pages/admin/GestionUsuarios/Usuario'; // ← NUEVA IMPORTACIÓN
import GestionRoles from '../pages/admin/GestionUsuarios/GestionRoles';
import EstadisticaReuniones from '../pages/admin/EncuestasyVotaciones/estadisticareuniones';
import EstadisticasEncuestasVotos from "../pages/admin/EncuestasyVotaciones/EstadisticasEncuestasVotos";


const AdminRoutes = () => {
  return (
   
      <Routes>
        {/* === DASHBOARD PRINCIPAL === */}
      <Route path="/panel-admin" element={<PanelAdmin />} />  
        {/* === PERFIL DE EMPRESA === */}
        
        <Route path="/datos-empresa" element={<DatosdeEmpresa />} />
        <Route path="/admin_filosofia" element={<Filosofia/>} />
      
        
        {/* === CONTENIDO === */}
        <Route path="/admin_documentos" element={<Documentos />} />
        <Route path="/admin_noticias" element={<Noticias />} />
        <Route path="/admin_preguntas" element={<Preguntas />} />
        
        {/* === ENCUESTAS Y VOTACIONES === */}
        <Route path="/admin_encuestas" element={<Encuestas />} />
        <Route path="/estadisticas_encuestas_votos/:id" element={<EstadisticasEncuestasVotos />} />
        <Route path="/estadisticas_anual" element={<Estadisticas />} />
        <Route path="/admin_votaciones" element={<Votaciones />} />
        <Route path="/estadistica_reuniones/:id" element={<EstadisticaReuniones />} />
        <Route path="/admin_reuniones" element={<Reuniones/>}/>
         <Route path="/admin_predicciones" element={<Predicciones/>}/> {/* ← NUEVA RUTA */}
        
        {/* === COMUNICACIONES === */}
        <Route path="/comunicaciones" element={<NotificacionesAutomatica />} />
        
        {/* === MONITOREO DE INCIDENCIAS === */}
        <Route path="/lista-negrayblanca" element={<ListasNegrayBlanca />} />
        <Route path="/auditoria" element={<Auditoria />} />
        
        {/* === GESTIÓN FINANCIERA === */}
        <Route path="/admin_transparencia" element={<Transparencia />} />
        <Route path="/admin_rifas" element={<Rifas />} />
        <Route path="/admin_contribuciones" element={<Contribuciones />} />
        <Route path="/config-cuentas" element={<ConfigCuentas />} />
        <Route path="/estadisticas_financiera" element={<EstadisticasFin />} />
        
        {/* === DOCUMENTACIÓN REGULATORIA === */}
        <Route path="/admin_DocumentosRegulatorios" element={<DocumentosRegulatorios/>} />
       
        
        {/* === GESTIÓN DE USUARIOS === */}
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/gestion-roles" element={<GestionRoles />} />
        <Route path="/usuario/:id" element={<Usuario />} /> 
      </Routes>
    
  );
};

export default AdminRoutes;
