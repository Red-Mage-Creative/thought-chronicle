import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Database, Trash2 } from 'lucide-react';
import { campaignValidationService, ValidationResult, OrphanedData } from '@/services/campaignValidationService';
import { campaignService } from '@/services/campaignService';
import { toast } from '@/hooks/use-toast';
import { LocalCampaign } from '@/types/campaigns';

interface DataMigrationModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
  userName: string;
}

export const DataMigrationModal = ({ open, onComplete, userId, userName }: DataMigrationModalProps) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [orphanedData, setOrphanedData] = useState<OrphanedData | null>(null);
  const [campaigns, setCampaigns] = useState<LocalCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [action, setAction] = useState<'assign' | 'delete'>('assign');
  const [isProcessing, setIsProcessing] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('My First Campaign');

  useEffect(() => {
    if (open) {
      // Run validation
      const result = campaignValidationService.validate();
      setValidation(result);

      // Get orphaned data
      const orphaned = campaignValidationService.getOrphanedData();
      setOrphanedData(orphaned);

      // Load existing campaigns
      const userCampaigns = campaignService.getUserCampaigns();
      setCampaigns(userCampaigns);
      if (userCampaigns.length > 0) {
        setSelectedCampaignId(userCampaigns[0].id);
      }
    }
  }, [open]);

  const handleCreateFirstCampaign = async () => {
    setIsProcessing(true);
    try {
      const campaign = await campaignService.createDefaultCampaign(userId, userName);
      
      // If there's orphaned data, assign it to the new campaign
      if (orphanedData && (orphanedData.thoughts.length > 0 || orphanedData.entities.length > 0)) {
        campaignValidationService.assignOrphanedDataToCampaign(campaign.id);
      }

      toast({
        title: 'Campaign Created',
        description: 'Your first campaign has been created and all data has been organized.'
      });

      onComplete();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignData = () => {
    if (!selectedCampaignId) {
      toast({
        title: 'Error',
        description: 'Please select a campaign.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      campaignValidationService.assignOrphanedDataToCampaign(selectedCampaignId);
      
      toast({
        title: 'Data Assigned',
        description: 'All orphaned data has been assigned to the selected campaign.'
      });

      onComplete();
    } catch (error) {
      console.error('Error assigning data:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteData = () => {
    setIsProcessing(true);
    try {
      campaignValidationService.deleteOrphanedData();
      
      toast({
        title: 'Data Deleted',
        description: 'All orphaned data has been deleted.'
      });

      onComplete();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!validation) return null;

  const hasNoCampaigns = validation.issues.some(i => i.type === 'no_campaigns');
  const hasOrphanedData = orphanedData && (orphanedData.thoughts.length > 0 || orphanedData.entities.length > 0);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Campaign Setup Required
          </DialogTitle>
          <DialogDescription>
            We need to organize your data to ensure everything is properly tracked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasNoCampaigns && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any campaigns yet. Let's create your first one!
              </AlertDescription>
            </Alert>
          )}

          {hasOrphanedData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Found {orphanedData.thoughts.length} thought(s) and {orphanedData.entities.length} entit(ies) 
                not linked to any campaign.
              </AlertDescription>
            </Alert>
          )}

          {hasNoCampaigns ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                  placeholder="Enter campaign name"
                />
              </div>

              <Button 
                onClick={handleCreateFirstCampaign} 
                disabled={isProcessing || !newCampaignName.trim()}
                className="w-full"
              >
                {isProcessing ? 'Creating...' : 'Create My First Campaign'}
              </Button>
            </div>
          ) : hasOrphanedData ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={action === 'assign' ? 'default' : 'outline'}
                  onClick={() => setAction('assign')}
                  className="flex-1"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Assign to Campaign
                </Button>
                <Button
                  variant={action === 'delete' ? 'default' : 'outline'}
                  onClick={() => setAction('delete')}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Data
                </Button>
              </div>

              {action === 'assign' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Campaign</label>
                    <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Choose a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map(campaign => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleAssignData} 
                    disabled={isProcessing || !selectedCampaignId}
                    className="w-full"
                  >
                    {isProcessing ? 'Assigning...' : 'Assign Data to Campaign'}
                  </Button>
                </div>
              )}

              {action === 'delete' && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will permanently delete all orphaned thoughts and entities. This action cannot be undone.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleDeleteData} 
                    disabled={isProcessing}
                    variant="destructive"
                    className="w-full"
                  >
                    {isProcessing ? 'Deleting...' : 'Delete All Orphaned Data'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">All data is properly organized!</p>
              <Button onClick={onComplete} className="mt-4">
                Continue
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};