import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dataMigrationService } from '@/services/dataMigrationService';
import { schemaVersionService } from '@/services/schemaVersionService';
import { CheckCircle2, XCircle, Clock, Database, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function MigrationHistoryPage() {
  const logs = dataMigrationService.getMigrationLogs();
  const backupInfo = dataMigrationService.getBackupInfo();
  const currentVersion = schemaVersionService.CURRENT_VERSION;
  const storedVersion = schemaVersionService.getStoredVersion();
  
  const handleRestoreBackup = () => {
    if (window.confirm('Are you sure you want to restore from backup? This will overwrite current data.')) {
      dataMigrationService.restoreBackup();
      window.location.reload();
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Migration History</h1>
          <p className="text-muted-foreground">
            View data migration logs and schema version information
          </p>
        </div>
        
        {/* Version Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Schema Version
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Version:</span>
              <Badge variant="outline">{currentVersion}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stored Version:</span>
              <Badge variant="outline">{storedVersion || 'Not set'}</Badge>
            </div>
            {storedVersion !== currentVersion && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Version mismatch detected. Migrations will run on next app restart.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Backup Info */}
        {backupInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Backup:</span>
                <span className="text-sm">{format(new Date(backupInfo.timestamp), 'PPpp')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Backup Version:</span>
                <Badge variant="outline">{backupInfo.version}</Badge>
              </div>
              <Button onClick={handleRestoreBackup} variant="outline" className="w-full">
                Restore from Backup
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Migration Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Migration Logs
            </CardTitle>
            <CardDescription>
              {logs.length === 0 ? 'No migrations have been run yet' : `${logs.length} migration(s) recorded`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No migration history available
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-0.5">
                      {log.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.migration}</span>
                        <Badge variant="outline" className="text-xs">{log.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(log.timestamp, 'PPpp')}
                      </p>
                      {log.error && (
                        <p className="text-sm text-red-500 mt-2">
                          Error: {log.error}
                        </p>
                      )}
                      {log.validationErrors && log.validationErrors > 0 && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-2">
                          {log.validationErrors} validation issue(s) auto-fixed
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
