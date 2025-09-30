const SCHEMA_VERSION_KEY = 'dnd_chronicle_schema_version';

export const schemaVersionService = {
  CURRENT_VERSION: '0.8.1',
  
  /**
   * Get the schema version stored in localStorage
   */
  getStoredVersion(): string | null {
    return localStorage.getItem(SCHEMA_VERSION_KEY);
  },
  
  /**
   * Save the current schema version to localStorage
   */
  setStoredVersion(version: string): void {
    localStorage.setItem(SCHEMA_VERSION_KEY, version);
  },
  
  /**
   * Check if migrations are needed
   */
  needsMigration(): boolean {
    const stored = this.getStoredVersion();
    if (!stored) return false; // Fresh install, no migration needed
    return stored !== this.CURRENT_VERSION;
  },
  
  /**
   * Convert version string to number for comparison
   * '0.7.0' -> 700, '0.8.1' -> 801
   */
  getVersionNumber(version: string): number {
    const parts = version.split('.').map(Number);
    return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
  },
  
  /**
   * Compare two versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1: string, v2: string): number {
    const n1 = this.getVersionNumber(v1);
    const n2 = this.getVersionNumber(v2);
    return n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
  }
};
