import { useState, useEffect, useMemo } from 'react';
import { localStorageService, LocalThought, LocalEntity } from '@/services/localStorageService';

export const useLocalThoughts = () => {
  const [thoughts, setThoughts] = useState<LocalThought[]>([]);

  const refreshFromStorage = () => {
    const data = localStorageService.getData();
    setThoughts(data.thoughts);
  };

  useEffect(() => {
    refreshFromStorage();
    
    // Listen for storage changes
    const handleStorageChange = () => refreshFromStorage();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addThought = (thoughtData: Omit<LocalThought, 'localId' | 'syncStatus'>) => {
    const newThought = localStorageService.addThought(thoughtData);
    refreshFromStorage();
    return newThought;
  };

  return { thoughts, addThought, refreshFromStorage };
};

export const useLocalEntities = () => {
  const [entities, setEntities] = useState<LocalEntity[]>([]);

  const refreshFromStorage = () => {
    const data = localStorageService.getData();
    setEntities(data.entities);
  };

  useEffect(() => {
    refreshFromStorage();
    
    const handleStorageChange = () => refreshFromStorage();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { entities, refreshFromStorage };
};

export const useOfflineSync = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const refreshSyncStatus = () => {
    const data = localStorageService.getData();
    setPendingCount(localStorageService.getPendingChangesCount());
    setLastSyncTime(data.lastSyncTime);
    setLastRefreshTime(data.lastRefreshTime);
  };

  useEffect(() => {
    refreshSyncStatus();
    
    const handleStorageChange = () => refreshSyncStatus();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const needsRefresh = useMemo(() => {
    return localStorageService.needsRefresh();
  }, [lastRefreshTime]);

  return { 
    pendingCount, 
    lastSyncTime, 
    lastRefreshTime,
    needsRefresh,
    refreshSyncStatus 
  };
};