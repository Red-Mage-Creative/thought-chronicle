import { useState } from 'react';
import { Plus, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { campaignService } from '@/services/campaignService';
import { LocalCampaign } from '@/types/campaigns';
import { CampaignCreateForm } from './CampaignCreateForm';

interface CampaignSelectorProps {
  campaigns: LocalCampaign[];
  currentCampaign: LocalCampaign | null;
  onCampaignChange: (campaignId: string) => void;
  onCampaignCreate: () => void;
}

export const CampaignSelector = ({ 
  campaigns, 
  currentCampaign, 
  onCampaignChange,
  onCampaignCreate 
}: CampaignSelectorProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCampaignSelect = (campaignId: string) => {
    campaignService.switchCampaign(campaignId);
    onCampaignChange(campaignId);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    onCampaignCreate();
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentCampaign?.localId || currentCampaign?.id || ''}
        onValueChange={handleCampaignSelect}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select campaign">
            {currentCampaign && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="truncate">{currentCampaign.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {currentCampaign.members.length}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.localId || campaign.id} value={campaign.localId || campaign.id}>
              <div className="flex items-center gap-2 w-full">
                <Users className="h-4 w-4" />
                <span className="truncate">{campaign.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {campaign.members.length}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <CampaignCreateForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      {currentCampaign && (
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};