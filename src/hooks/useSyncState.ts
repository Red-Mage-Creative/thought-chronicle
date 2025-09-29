import { useState, useEffect } from 'react';
import { SyncStatus } from '@/types/sync';
import { dataStorageService } from '@/services/dataStorageService';

export const useSyncState = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingChanges: 0,
    lastSyncTime: null,
    lastRefreshTime: null
  });

  const refreshSyncStatus = () => {
    const data = dataStorageService.getData();
    const pendingChanges = 
      data.pendingChanges.thoughts.added.length +
      data.pendingChanges.thoughts.modified.length +
      data.pendingChanges.thoughts.deleted.length +
      data.pendingChanges.entities.added.length +
      data.pendingChanges.entities.modified.length +
      data.pendingChanges.entities.deleted.length;

    setSyncStatus({
      isOnline: navigator.onLine,
      pendingChanges,
      lastSyncTime: data.lastSyncTime,
      lastRefreshTime: data.lastRefreshTime
    });
  };

  useEffect(() => {
    refreshSyncStatus();
    
    const handleOnline = () => refreshSyncStatus();
    const handleOffline = () => refreshSyncStatus();
    const handleStorageUpdate = () => refreshSyncStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storageUpdated', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storageUpdated', handleStorageUpdate);
    };
  }, []);

  return {
    syncStatus,
    refreshSyncStatus
  };
};