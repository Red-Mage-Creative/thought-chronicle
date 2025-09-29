export interface SyncStatus {
  isOnline: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  lastRefreshTime: Date | null;
}

export interface PendingChanges {
  thoughts: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
  entities: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}