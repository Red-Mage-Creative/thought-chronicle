import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Upload, Scroll } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineData";
import { useState } from "react";

interface SyncBannerProps {
  onSync: () => Promise<void>;
}

export const SyncBanner = ({ onSync }: SyncBannerProps) => {
  const { pendingCount } = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);

  if (pendingCount === 0) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getFantasyMessage = (count: number) => {
    if (count === 1) return "One tale awaits the scribes...";
    if (count <= 3) return `${count} chronicles ready for the Archive`;
    if (count <= 5) return `${count} adventures await preservation`;
    return `${count} epic tales ready to be recorded in history`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 mb-4">
      <Card className="border-amber-300 bg-amber-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-amber-700">
            <Scroll className="h-5 w-5" />
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-amber-800">
              {getFantasyMessage(pendingCount)}
            </p>
            <p className="text-sm text-amber-600">
              Your chronicles are safely stored locally and ready to sync.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isSyncing ? "Committing..." : "Send to Archive"}
        </Button>
      </div>
      </Card>
    </div>
  );
};