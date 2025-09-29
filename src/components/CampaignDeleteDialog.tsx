import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, User, AlertTriangle } from 'lucide-react';
import { LocalCampaign } from '@/types/campaigns';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';

interface CampaignStats {
  thoughtsCount: number;
  entitiesCount: number;
}

interface CampaignDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: LocalCampaign;
  availableCampaigns: LocalCampaign[];
  onSuccess: () => void;
}

export const CampaignDeleteDialog = ({
  open,
  onOpenChange,
  campaign,
  availableCampaigns,
  onSuccess
}: CampaignDeleteDialogProps) => {
  const [stats, setStats] = useState<CampaignStats>({ thoughtsCount: 0, entitiesCount: 0 });
  const [migrationAction, setMigrationAction] = useState<'move' | 'delete'>('move');
  const [targetCampaignId, setTargetCampaignId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && campaign.localId) {
      const campaignStats = campaignService.getCampaignStats(campaign.localId);
      setStats(campaignStats);
      
      // Set default target campaign if available
      if (availableCampaigns.length > 0 && !targetCampaignId) {
        setTargetCampaignId(availableCampaigns[0].localId!);
      }
    }
  }, [open, campaign.localId, availableCampaigns, targetCampaignId]);

  const hasData = stats.thoughtsCount > 0 || stats.entitiesCount > 0;
  const canDelete = !hasData || (migrationAction === 'move' && targetCampaignId) || migrationAction === 'delete';

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      setIsDeleting(true);
      
      const migrationOptions = {
        action: migrationAction,
        targetCampaignId: migrationAction === 'move' ? targetCampaignId : undefined
      };

      await campaignService.deleteCampaign(campaign.localId!, migrationOptions);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete campaign');
      console.error('Failed to delete campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are about to delete "<strong>{campaign.name}</strong>". This action cannot be undone.
            </AlertDescription>
          </Alert>

          {/* Campaign Data Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Campaign Data</CardTitle>
              <CardDescription>
                This campaign contains the following data:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.thoughtsCount} thought{stats.thoughtsCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.entitiesCount} entit{stats.entitiesCount !== 1 ? 'ies' : 'y'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Migration Options */}
          {hasData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">What should happen to your data?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <RadioGroup value={migrationAction} onValueChange={(value: 'move' | 'delete') => setMigrationAction(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="move" id="move" />
                    <Label htmlFor="move">Move to another campaign</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delete" id="delete" />
                    <Label htmlFor="delete" className="text-destructive">Delete all data permanently</Label>
                  </div>
                </RadioGroup>

                {migrationAction === 'move' && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium">Select target campaign:</Label>
                    <Select value={targetCampaignId} onValueChange={setTargetCampaignId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCampaigns.map((camp) => (
                          <SelectItem key={camp.localId} value={camp.localId!}>
                            {camp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Campaign'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};