// =====================================================
// Sistema de almacenamiento local con IndexedDB
// Soporte offline y sincronización
// Autor: Jonathan García Martínez
// Versión: v1.0.0
// =====================================================

const DB_NAME = 'SUTUTEH_DB';
const DB_VERSION = 1;

export const STORES = {
  USER_DATA: 'userData',
  LOGROS: 'logros',
  PUNTOS: 'puntos',
  NOTICIAS: 'noticias',
  REUNIONES: 'reuniones',
  OFFLINE_QUEUE: 'offlineQueue'
};

// ====== INDEXEDDB ======

// Inicializar IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('❌ Error al abrir IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('✅ IndexedDB inicializado correctamente');
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Crear object stores si no existen
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          if (storeName === STORES.OFFLINE_QUEUE) {
            const store = db.createObjectStore(storeName, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          } else {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
          console.log(`✅ Object store creado: ${storeName}`);
        }
      });
    };
  });
};

// Guardar datos en IndexedDB
export const saveData = async (storeName, data) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => {
        console.log(`✅ Datos guardados en ${storeName}:`, data.id);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error(`❌ Error al guardar en ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ Error en saveData:', error);
    throw error;
  }
};

// Obtener datos de IndexedDB
export const getData = async (storeName, key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error en getData:', error);
    throw error;
  }
};

// Obtener todos los datos
export const getAllData = async (storeName) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error en getAllData:', error);
    throw error;
  }
};

// Eliminar datos
export const deleteData = async (storeName, key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        console.log(`✅ Datos eliminados de ${storeName}:`, key);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error en deleteData:', error);
    throw error;
  }
};

// Limpiar store completo
export const clearStore = async (storeName) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log(`✅ Store limpiado: ${storeName}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error en clearStore:', error);
    throw error;
  }
};

// ====== COLA DE SINCRONIZACIÓN OFFLINE ======

// Agregar petición a la cola de sincronización
export const addToSyncQueue = async (requestData) => {
  const data = {
    url: requestData.url,
    method: requestData.method,
    body: requestData.body,
    headers: requestData.headers || {},
    timestamp: Date.now()
  };
  
  console.log('📥 Agregando a cola de sincronización:', data);
  return await saveData(STORES.OFFLINE_QUEUE, data);
};

// Procesar cola de sincronización
export const processSyncQueue = async () => {
  const queue = await getAllData(STORES.OFFLINE_QUEUE);
  console.log(`🔄 Procesando ${queue.length} peticiones en cola`);
  
  const results = [];
  
  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        body: item.body,
        headers: {
          'Content-Type': 'application/json',
          ...item.headers
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        await deleteData(STORES.OFFLINE_QUEUE, item.id);
        console.log('✅ Petición sincronizada:', item.url);
        results.push({ success: true, item });
      } else {
        console.warn('⚠️ Petición falló:', item.url, response.status);
        results.push({ success: false, item, error: response.statusText });
      }
    } catch (error) {
      console.error('❌ Error al sincronizar:', item.url, error);
      results.push({ success: false, item, error: error.message });
    }
  }
  
  return results;
};

// Obtener cantidad de peticiones pendientes
export const getPendingCount = async () => {
  const queue = await getAllData(STORES.OFFLINE_QUEUE);
  return queue.length;
};

// ====== LOCALSTORAGE CON CACHÉ ======

export const localCache = {
  // Guardar con expiración
  set: (key, value, expiryMinutes = 60) => {
    const data = {
      value,
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Cache guardado: ${key} (expira en ${expiryMinutes}min)`);
    } catch (error) {
      console.error('❌ Error al guardar en localStorage:', error);
    }
  },
  
  // Obtener y verificar expiración
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const data = JSON.parse(item);
      
      // Verificar si expiró
      if (Date.now() > data.expiry) {
        localStorage.removeItem(key);
        console.log(`⏰ Cache expirado y eliminado: ${key}`);
        return null;
      }
      
      console.log(`✅ Cache recuperado: ${key}`);
      return data.value;
    } catch (error) {
      console.error('❌ Error al leer localStorage:', error);
      return null;
    }
  },
  
  // Eliminar
  remove: (key) => {
    localStorage.removeItem(key);
    console.log(`🗑️ Cache eliminado: ${key}`);
  },
  
  // Limpiar todo
  clear: () => {
    localStorage.clear();
    console.log('🗑️ Todo el cache eliminado');
  },
  
  // Obtener todas las keys
  getAllKeys: () => {
    return Object.keys(localStorage);
  },
  
  // Obtener tamaño usado (aproximado en KB)
  getSize: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2) + ' KB';
  }
};

// ====== HELPERS ======

// Verificar si IndexedDB está disponible
export const isIndexedDBAvailable = () => {
  return 'indexedDB' in window;
};

// Verificar si localStorage está disponible
export const isLocalStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Inicializar todo el sistema de almacenamiento
export const initStorage = async () => {
  console.log('🚀 Inicializando sistema de almacenamiento...');
  
  if (!isIndexedDBAvailable()) {
    console.warn('⚠️ IndexedDB no disponible');
  }
  
  if (!isLocalStorageAvailable()) {
    console.warn('⚠️ LocalStorage no disponible');
  }
  
  try {
    await initDB();
    console.log('✅ Sistema de almacenamiento listo');
  } catch (error) {
    console.error('❌ Error al inicializar almacenamiento:', error);
  }
};