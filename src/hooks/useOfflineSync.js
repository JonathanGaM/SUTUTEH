import { useState, useEffect } from 'react';
import { processSyncQueue, getPendingCount } from '../components/utils/storage';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error', 'offline'
  const [pendingRequests, setPendingRequests] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Actualizar contador de pendientes
  const updatePendingCount = async () => {
    try {
      const count = await getPendingCount();
      setPendingRequests(count);
    } catch (error) {
      console.error('Error al obtener pendientes:', error);
    }
  };

  useEffect(() => {
    // Cargar contador inicial
    updatePendingCount();

    const handleOnline = async () => {
      console.log('✅ Conexión restaurada');
      setIsOnline(true);
      setSyncStatus('syncing');
      
      try {
        const results = await processSyncQueue();
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`✅ Sincronización completada: ${successful} exitosas, ${failed} fallidas`);
        setSyncStatus('success');
        setPendingRequests(failed);
        setLastSyncTime(new Date());
        
        // Resetear después de 3 segundos
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error) {
        console.error('❌ Error en sincronización:', error);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    };

    const handleOffline = () => {
      console.log('⚠️ Sin conexión - Modo offline activado');
      setIsOnline(false);
      setSyncStatus('offline');
    };

    // Agregar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar pendientes cada 30 segundos
    const interval = setInterval(updatePendingCount, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Función para forzar sincronización manual
  const forceSync = async () => {
    if (!isOnline) {
      console.warn('⚠️ No se puede sincronizar: sin conexión');
      return false;
    }

    setSyncStatus('syncing');
    try {
      const results = await processSyncQueue();
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`✅ Sincronización manual: ${successful} exitosas, ${failed} fallidas`);
      setSyncStatus('success');
      setPendingRequests(failed);
      setLastSyncTime(new Date());
      
      setTimeout(() => setSyncStatus('idle'), 3000);
      return true;
    } catch (error) {
      console.error('❌ Error en sincronización manual:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return false;
    }
  };

  return { 
    isOnline, 
    syncStatus, 
    pendingRequests, 
    lastSyncTime,
    forceSync,
    updatePendingCount
  };
};