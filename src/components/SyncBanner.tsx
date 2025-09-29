import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Upload, Eye } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineData";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { dataStorageService } from "@/services/dataStorageService";

interface SyncBannerProps {
  onSync: () => Promise<void>;
}

export const SyncBanner = ({ onSync }: SyncBannerProps) => {
  const { pendingCount } = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showPendingDetails, setShowPendingDetails] = useState(false);

  if (pendingCount === 0) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getPendingChangesDetails = () => {
    const data = dataStorageService.getData();
    return data.pendingChanges;
  };

  const formatCount = (count: number) => {
    return count === 1 ? "1 change" : `${count} changes`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 mb-4">
      <Card className="border-amber-300 bg-amber-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {formatCount(pendingCount)} pending
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={showPendingDetails} onOpenChange={setShowPendingDetails}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Pending Changes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {(() => {
                    const details = getPendingChangesDetails();
                    const hasChanges = details.thoughts.added.length + details.thoughts.modified.length + 
                                     details.thoughts.deleted.length + details.entities.added.length + 
                                     details.entities.modified.length + details.entities.deleted.length > 0;
                    
                    if (!hasChanges) {
                      return <p className="text-sm text-muted-foreground">No pending changes</p>;
                    }
                    
                    return (
                      <>
                        {(details.thoughts.added.length + details.thoughts.modified.length + details.thoughts.deleted.length) > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Thoughts</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              {details.thoughts.added.length > 0 && <li>• {details.thoughts.added.length} added</li>}
                              {details.thoughts.modified.length > 0 && <li>• {details.thoughts.modified.length} modified</li>}
                              {details.thoughts.deleted.length > 0 && <li>• {details.thoughts.deleted.length} deleted</li>}
                            </ul>
                          </div>
                        )}
                        {(details.entities.added.length + details.entities.modified.length + details.entities.deleted.length) > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Entities</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              {details.entities.added.length > 0 && <li>• {details.entities.added.length} added</li>}
                              {details.entities.modified.length > 0 && <li>• {details.entities.modified.length} modified</li>}
                              {details.entities.deleted.length > 0 && <li>• {details.entities.deleted.length} deleted</li>}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => setShowSyncConfirm(true)}
              disabled={isSyncing}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Upload className="mr-1 h-3 w-3" />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
          </div>
        </div>
      </Card>
      
      <ConfirmationDialog
        open={showSyncConfirm}
        onOpenChange={setShowSyncConfirm}
        title="Sync Changes"
        description={`This will sync ${formatCount(pendingCount)} to your database. Continue?`}
        confirmText="Yes, Sync"
        cancelText="Cancel"
        onConfirm={handleSync}
      />
    </div>
  );
};