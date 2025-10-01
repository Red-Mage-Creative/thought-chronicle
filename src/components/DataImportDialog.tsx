import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { dataImportService } from '@/services/dataImportService';
import { ExportData } from '@/services/dataExportService';

interface DataImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const DataImportDialog = ({ open, onOpenChange, onImportComplete }: DataImportDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ExportData | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');
    setFileData(null);

    try {
      const data = await dataImportService.validateImportFile(file);
      setFileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!fileData) return;

    setIsProcessing(true);
    setError('');

    try {
      const result = dataImportService.importData(fileData);
      
      if (result.success) {
        setImportComplete(true);
        setTimeout(() => {
          onImportComplete();
          handleClose();
        }, 2000);
      } else {
        setError(result.summary.errors.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileData(null);
    setError('');
    setImportComplete(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Chronicle Data
          </DialogTitle>
          <DialogDescription>
            Upload a Chronicle JSON export file to restore your campaign data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileJson className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> JSON file
                </p>
                {selectedFile && (
                  <p className="text-xs text-primary">{selectedFile.name}</p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </label>
          </div>

          {/* File Info */}
          {fileData && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="font-medium">File Information:</div>
              <div className="space-y-1 text-muted-foreground">
                <div>Campaign: <span className="text-foreground">{fileData.metadata.campaignName}</span></div>
                <div>Exported: <span className="text-foreground">{new Date(fileData.metadata.exportDate).toLocaleString()}</span></div>
                <div>Thoughts: <span className="text-foreground">{fileData.data.thoughts.length}</span></div>
                <div>Entities: <span className="text-foreground">{fileData.data.entities.length}</span></div>
              </div>
            </div>
          )}

          {/* Warning */}
          {fileData && !importComplete && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will replace all current campaign data. Make sure you've exported your current data first.
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {importComplete && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Import successful! Refreshing data...
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!fileData || isProcessing || importComplete}
          >
            {isProcessing ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
