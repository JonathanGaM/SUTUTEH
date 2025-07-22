// src/config/apiConfig.js

// Configuración automática del API URL
const getApiUrl = () => {
  // Si estamos en desarrollo (localhost), usar backend local por defecto
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
  
  // Si estamos en producción (hostinger), usar backend de Render
  return process.env.REACT_APP_API_URL || 'https://sututeh-server.onrender.com';
};

export const API_URL = getApiUrl();

// Función helper para hacer requests con fetch
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // Para enviar cookies JWT
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Si es FormData, no establecer Content-Type (se establece automáticamente)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
  //  console.error(`❌ Error en request a ${url}:`, error);
    throw error;
  }
};

// Función helper para configurar axios globalmente
export const configureAxios = (axios) => {
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = true;
  
  // Interceptor para logs de desarrollo
  if (process.env.NODE_ENV === 'development') {
    axios.interceptors.request.use(
      (config) => {
    //    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
    //    console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );
  }
};

// Función helper mejorada para fetch global
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { 
    method: 'POST', 
    body: data instanceof FormData ? data : JSON.stringify(data) 
  }),
  put: (endpoint, data) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: data instanceof FormData ? data : JSON.stringify(data) 
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

// Log de configuración actual
//console.log(`🌐 API URL configurada: ${API_URL}`);

export default { API_URL, apiRequest, configureAxios };