import React from 'react';
import { Box, Typography, Snackbar, Alert, IconButton, Chip } from '@mui/material';
import { useOfflineSync } from '../hooks/useOfflineSync';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function OfflineIndicator() {
  const { isOnline, syncStatus, pendingRequests, forceSync } = useOfflineSync();

  return (
    <>
      {/* Banner fijo cuando está offline */}
      {!isOnline && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFA726',
            color: 'white',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            zIndex: 9998,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WifiOffIcon />
            <Typography variant="body2" fontWeight="bold">
              Sin conexión - Trabajando offline
            </Typography>
          </Box>
          
          {pendingRequests > 0 && (
            <Chip
              label={`${pendingRequests} pendientes`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>
      )}

      {/* Notificación de sincronización en progreso */}
      <Snackbar
        open={syncStatus === 'syncing'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          icon={
            <SyncIcon 
              sx={{ 
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                }
              }} 
            />
          }
          severity="info"
          sx={{ width: '100%' }}
        >
          Sincronizando datos...
        </Alert>
      </Snackbar>

      {/* Notificación de sincronización exitosa */}
      <Snackbar
        open={syncStatus === 'success'}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          icon={<CloudDoneIcon />} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          ✅ Datos sincronizados correctamente
        </Alert>
      </Snackbar>

      {/* Notificación de error */}
      <Snackbar
        open={syncStatus === 'error'}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          icon={<ErrorOutlineIcon />} 
          severity="error" 
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={forceSync}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          Error al sincronizar. Toca para reintentar.
        </Alert>
      </Snackbar>
    </>
  );
}