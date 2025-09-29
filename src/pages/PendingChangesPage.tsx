import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Upload, Trash2, Edit3, Plus, ArrowLeft } from "lucide-react";
import { dataStorageService } from "@/services/dataStorageService";
import { syncService } from "@/services/syncService";
import { useOfflineSync } from "@/hooks/useOfflineData";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function PendingChangesPage() {
  const navigate = useNavigate();
  const { pendingCount, refreshSyncStatus } = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncService.syncToServer();
      if (result.success) {
        toast.success(result.message);
        refreshSyncStatus();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const clearAllPendingChanges = () => {
    dataStorageService.clearPendingChanges();
    refreshSyncStatus();
    toast.success("All pending changes cleared");
  };

  const getPendingChangesDetails = () => {
    const data = dataStorageService.getData();
    const details = data.pendingChanges;
    
    const changes: Array<{
      id: string;
      type: 'thought' | 'entity';
      action: 'added' | 'modified' | 'deleted';
      name: string;
      timestamp: Date;
    }> = [];

    // Add thought changes
    details.thoughts.added.forEach(id => {
      const thought = data.thoughts.find(t => t.localId === id || t.id === id);
      changes.push({
        id,
        type: 'thought',
        action: 'added',
        name: thought?.content.substring(0, 30) + '...' || 'Unknown thought',
        timestamp: thought?.modifiedLocally || new Date()
      });
    });

    details.thoughts.modified.forEach(id => {
      const thought = data.thoughts.find(t => t.localId === id || t.id === id);
      changes.push({
        id,
        type: 'thought',
        action: 'modified',
        name: thought?.content.substring(0, 30) + '...' || 'Unknown thought',
        timestamp: thought?.modifiedLocally || new Date()
      });
    });

    details.thoughts.deleted.forEach(id => {
      changes.push({
        id,
        type: 'thought',
        action: 'deleted',
        name: `Deleted thought (${id.substring(0, 8)}...)`,
        timestamp: new Date()
      });
    });

    // Add entity changes
    details.entities.added.forEach(id => {
      const entity = data.entities.find(e => e.localId === id || e.id === id);
      changes.push({
        id,
        type: 'entity',
        action: 'added',
        name: entity?.name || 'Unknown entity',
        timestamp: entity?.modifiedLocally || new Date()
      });
    });

    details.entities.modified.forEach(id => {
      const entity = data.entities.find(e => e.localId === id || e.id === id);
      changes.push({
        id,
        type: 'entity',
        action: 'modified',
        name: entity?.name || 'Unknown entity',
        timestamp: entity?.modifiedLocally || new Date()
      });
    });

    details.entities.deleted.forEach(id => {
      changes.push({
        id,
        type: 'entity',
        action: 'deleted',
        name: `Deleted entity (${id.substring(0, 8)}...)`,
        timestamp: new Date()
      });
    });

    return changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added': return <Plus className="h-4 w-4" />;
      case 'modified': return <Edit3 className="h-4 w-4" />;
      case 'deleted': return <Trash2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'added': return 'bg-green-100 text-green-800 border-green-300';
      case 'modified': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'deleted': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const changes = getPendingChangesDetails();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pending Changes</h1>
            <p className="text-muted-foreground">
              Review and manage your offline changes before syncing
            </p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {pendingCount} {pendingCount === 1 ? 'change' : 'changes'} pending sync
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowSyncConfirm(true)}
                disabled={isSyncing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isSyncing ? "Syncing..." : "Sync All"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={clearAllPendingChanges}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Log</CardTitle>
          <CardDescription>
            All pending changes that will be synchronized with your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {changes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No pending changes</h3>
              <p className="text-muted-foreground">All your changes are synchronized</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-xs">Type</TableHead>
                  <TableHead className="w-20 text-xs">Action</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="w-32 text-xs">Modified</TableHead>
                  <TableHead className="w-24 text-xs">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((change, index) => (
                  <TableRow key={`${change.type}-${change.action}-${change.id}-${index}`} className="text-xs">
                    <TableCell className="py-2">
                      <Badge variant="outline" className="capitalize text-xs px-1 py-0">
                        {change.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${getActionColor(change.action)}`}>
                        {getActionIcon(change.action)}
                        {change.action}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium py-2 text-xs">
                      {change.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-2 text-xs">
                      {change.timestamp.toLocaleDateString()} {change.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-2">
                      {change.id.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showSyncConfirm}
        onOpenChange={setShowSyncConfirm}
        title="Sync Changes"
        description={`This will sync ${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} to your database. Continue?`}
        confirmText="Yes, Sync"
        cancelText="Cancel"
        onConfirm={handleSync}
      />
    </div>
  );
}