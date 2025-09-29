import { useState, useEffect, useMemo } from 'react';
import { dataStorageService } from '@/services/dataStorageService';
import { LocalThought } from '@/types/thoughts';
import { LocalEntity } from '@/types/entities';

export const useLocalThoughts = () => {
  const [thoughts, setThoughts] = useState<LocalThought[]>([]);

  const refreshFromStorage = () => {
    const data = dataStorageService.getData();
    setThoughts(data.thoughts);
  };

  useEffect(() => {
    refreshFromStorage();
    
    // Listen for storage changes
    const handleStorageChange = () => refreshFromStorage();
    const handleStorageUpdate = () => refreshFromStorage();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageUpdate);
    };
  }, []);

  const addThought = (thoughtData: Omit<LocalThought, 'localId' | 'syncStatus'>) => {
    const newThought = dataStorageService.addThought(thoughtData);
    refreshFromStorage();
    return newThought;
  };

  return { thoughts, addThought, refreshFromStorage };
};

export const useLocalEntities = () => {
  const [entities, setEntities] = useState<LocalEntity[]>([]);

  const refreshFromStorage = () => {
    const data = dataStorageService.getData();
    setEntities(data.entities);
  };

  useEffect(() => {
    refreshFromStorage();
    
    const handleStorageChange = () => refreshFromStorage();
    const handleStorageUpdate = () => refreshFromStorage();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageUpdate);
    };
  }, []);

  const addEntity = (entityData: Omit<LocalEntity, 'localId' | 'syncStatus'>) => {
    const newEntity = dataStorageService.addEntity(entityData);
    refreshFromStorage();
    return newEntity;
  };

  return { entities, addEntity, refreshFromStorage };
};

export const useOfflineSync = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const refreshSyncStatus = () => {
    const data = dataStorageService.getData();
    setPendingCount(dataStorageService.getPendingChangesCount());
    setLastSyncTime(data.lastSyncTime);
    setLastRefreshTime(data.lastRefreshTime);
  };

  useEffect(() => {
    refreshSyncStatus();
    
    const handleStorageChange = () => refreshSyncStatus();
    const handleStorageUpdate = () => refreshSyncStatus();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageUpdate);
    };
  }, []);

  const needsRefresh = useMemo(() => {
    return dataStorageService.needsRefresh();
  }, [lastRefreshTime]);

  return { 
    pendingCount, 
    lastSyncTime, 
    lastRefreshTime,
    needsRefresh,
    refreshSyncStatus 
  };
};