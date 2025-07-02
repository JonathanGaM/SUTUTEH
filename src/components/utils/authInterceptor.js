// src/utils/authInterceptor.js

// Guardar la función fetch original
const originalFetch = window.fetch;

// Sobrescribir fetch globalmente para manejar expiración de tokens
window.fetch = async function(url, options = {}) {
  try {
    // Asegurar que se envíen las cookies en todas las peticiones
    const response = await originalFetch(url, {
      ...options,
      credentials: 'include'
    });
    
    // Verificar si hay error de autenticación (401)
    if (response.status === 401) {
      console.log('Token expirado - redirigiendo al home');
      
      // Mostrar mensaje al usuario
      alert('Tu sesión ha expirado. Serás redirigido al inicio.');
      
      // Redirigir al home
      window.location.href = '/';
      
      return response;
    }
    
    // Verificar header especial del backend (por si lo implementas después)
    if (response.headers.get('X-Auth-Expired') === 'true') {
      console.log('Token expirado (header) - redirigiendo al home');
      alert('Tu sesión ha expirado. Serás redirigido al inicio.');
      window.location.href = '/';
      return response;
    }
    
    return response;
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

// Función auxiliar para hacer peticiones con manejo específico de auth
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
    
    // Si es 401, ya se maneja automáticamente por el interceptor global
    // Solo retornamos null para indicar que hubo error de auth
    if (response.status === 401) {
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('Error en fetchWithAuth:', error);
    throw error;
  }
};

export default fetchWithAuth;