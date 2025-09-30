import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RotateCcw, ExternalLink, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataMigrationService } from '@/services/dataMigrationService';

interface MigrationErrorScreenProps {
  error: {
    message: string;
    migration?: string;
    version?: string;
    details?: string;
  };
  hasBackup: boolean;
  onRetry?: () => void;
  onContinueAnyway?: () => void;
}

export const MigrationErrorScreen = ({ 
  error, 
  hasBackup,
  onRetry,
  onContinueAnyway 
}: MigrationErrorScreenProps) => {
  const navigate = useNavigate();

  const handleRestoreBackup = () => {
    if (window.confirm('This will restore your data from the last backup. Continue?')) {
      dataMigrationService.restoreBackup();
      window.location.reload();
    }
  };

  const handleViewHistory = () => {
    navigate('/migration-history');
  };

  const handleReportIssue = () => {
    const issueBody = encodeURIComponent(
      `Migration Error Report\n\n` +
      `Migration: ${error.migration || 'Unknown'}\n` +
      `Version: ${error.version || 'Unknown'}\n` +
      `Error: ${error.message}\n\n` +
      `Details: ${error.details || 'None'}\n\n` +
      `Browser: ${navigator.userAgent}\n` +
      `Timestamp: ${new Date().toISOString()}`
    );
    
    window.open(
      `https://github.com/yourusername/dnd-chronicle/issues/new?title=Migration%20Error&body=${issueBody}`,
      '_blank'
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Migration Error</CardTitle>
          </div>
          <CardDescription>
            An error occurred while updating your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {error.migration ? `Migration Failed: ${error.migration}` : 'Migration Failed'}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              <p>{error.message}</p>
              {error.details && (
                <p className="text-xs mt-2 font-mono bg-destructive/10 p-2 rounded">
                  {error.details}
                </p>
              )}
            </AlertDescription>
          </Alert>

          {/* Recovery Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Recovery Options</h3>
            
            {hasBackup && (
              <Button 
                onClick={handleRestoreBackup} 
                variant="default"
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Restore from Backup
              </Button>
            )}

            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Migration
              </Button>
            )}

            <Button 
              onClick={handleViewHistory} 
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Migration History
            </Button>
          </div>

          {/* Continue Anyway Warning */}
          {onContinueAnyway && (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Continue at your own risk</AlertTitle>
                <AlertDescription>
                  You can continue using the app, but some features may not work correctly.
                  We recommend restoring from backup or reporting this issue.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={onContinueAnyway} 
                variant="ghost"
                className="w-full"
              >
                Continue Anyway (Not Recommended)
              </Button>
            </div>
          )}

          {/* Additional Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleReportIssue} 
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {/* Technical Details */}
          {error.version && (
            <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
              <p>Target Version: {error.version}</p>
              <p>Error ID: {Date.now()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
