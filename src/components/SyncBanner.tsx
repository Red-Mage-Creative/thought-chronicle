import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Upload, ExternalLink } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineData";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useNavigate } from "react-router-dom";

interface SyncBannerProps {
  onSync: () => Promise<void>;
}

export const SyncBanner = ({ onSync }: SyncBannerProps) => {
  const navigate = useNavigate();
  const { pendingCount } = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  if (pendingCount === 0) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatCount = (count: number) => {
    return count === 1 ? "1 change" : `${count} changes`;
  };

  const getFantasyMessage = (count: number) => {
    const messages = [
      "Your scrolls await the chronicler's seal",
      "Unsent tales linger in the ethereal realm",
      "The cosmic ledger awaits your inscriptions",
      "Ancient wisdom remains unbound to the eternal records",
      "Your adventures echo unrecorded in the astral plane",
      "The mystical archive thirsts for your chronicles",
      "Temporal disturbances detected in the narrative stream",
      "The realm's memory crystals require synchronization"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="mb-4">
      <Card className="border-amber-300 bg-amber-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-amber-800">
                {getFantasyMessage(pendingCount)}
              </span>
              <span className="text-xs text-amber-700">
                {formatCount(pendingCount)} pending
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/pending-changes')}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              View Details
            </Button>
            
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