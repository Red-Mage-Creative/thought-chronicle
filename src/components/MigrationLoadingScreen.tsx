import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle2, Loader2, Shield } from 'lucide-react';

export interface MigrationProgress {
  phase: 'backup' | 'migration' | 'validation' | 'complete';
  currentStep: number;
  totalSteps: number;
  currentMigration?: string;
  validationProgress?: {
    entitiesChecked: number;
    thoughtsChecked: number;
    campaignsChecked: number;
    issuesFixed: number;
  };
  message: string;
}

interface MigrationLoadingScreenProps {
  progress: MigrationProgress;
}

export const MigrationLoadingScreen = ({ progress }: MigrationLoadingScreenProps) => {
  const progressPercent = progress.totalSteps > 0 
    ? (progress.currentStep / progress.totalSteps) * 100 
    : 0;

  const getPhaseIcon = () => {
    switch (progress.phase) {
      case 'backup':
        return <Shield className="h-6 w-6 text-primary animate-pulse" />;
      case 'migration':
        return <Database className="h-6 w-6 text-primary animate-pulse" />;
      case 'validation':
        return <CheckCircle2 className="h-6 w-6 text-primary animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
    }
  };

  const getPhaseLabel = () => {
    switch (progress.phase) {
      case 'backup':
        return 'Creating Backup';
      case 'migration':
        return 'Running Migrations';
      case 'validation':
        return 'Validating Data';
      case 'complete':
        return 'Complete';
      default:
        return 'Initializing';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {getPhaseIcon()}
            <CardTitle>Initializing Application</CardTitle>
          </div>
          <CardDescription>
            Preparing your data for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phase Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Phase:</span>
            <Badge variant="outline">{getPhaseLabel()}</Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {progress.currentStep} / {progress.totalSteps}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Current Migration */}
          {progress.currentMigration && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Running:</p>
              <p className="text-sm font-medium">{progress.currentMigration}</p>
            </div>
          )}

          {/* Validation Progress */}
          {progress.validationProgress && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Validation Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entities:</span>
                  <span>{progress.validationProgress.entitiesChecked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thoughts:</span>
                  <span>{progress.validationProgress.thoughtsChecked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaigns:</span>
                  <span>{progress.validationProgress.campaignsChecked}</span>
                </div>
                {progress.validationProgress.issuesFixed > 0 && (
                  <div className="flex justify-between text-yellow-600 dark:text-yellow-500">
                    <span>Issues Auto-Fixed:</span>
                    <span className="font-medium">{progress.validationProgress.issuesFixed}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mt-0.5 animate-spin flex-shrink-0" />
            <p>{progress.message}</p>
          </div>

          {/* Helpful Note */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            This usually takes just a few seconds
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
