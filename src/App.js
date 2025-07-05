// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./components/layout/Layout";
import axios from 'axios';
import { configureAxios } from './config/apiConfig';


configureAxios(axios);

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
