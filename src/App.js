// src/App.jsx
import React, { useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./components/layout/Layout";
import axios from 'axios';
import { configureAxios } from './config/apiConfig';
import OfflineIndicator from "./components/OfflineIndicator";
import { initStorage } from './components/utils/storage';

configureAxios(axios);

function App() {
  // Inicializar sistema de almacenamiento al cargar la app
  useEffect(() => {
    console.log('🚀 Inicializando SUTUTEH PWA...');
    initStorage();
  }, []);


  return (
    <Router>
      <OfflineIndicator />
      <Layout />
    </Router>
  );
}

export default App;
