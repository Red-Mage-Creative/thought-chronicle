import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocalCampaign } from "@/types/campaigns";
import { campaignService } from "@/services/campaignService";
import { Users, Check } from "lucide-react";
import { toast } from "sonner";

interface QuickCampaignSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: LocalCampaign[];
  currentCampaignId: string | null;
}

export const QuickCampaignSwitcher = ({
  open,
  onOpenChange,
  campaigns,
  currentCampaignId
}: QuickCampaignSwitcherProps) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>(
    currentCampaignId || campaigns[0]?.localId || campaigns[0]?.id || ''
  );

  const handleSwitch = async () => {
    if (selectedCampaign && selectedCampaign !== currentCampaignId) {
      try {
        await campaignService.switchCampaign(selectedCampaign);
        toast.success('Campaign switched successfully');
        onOpenChange(false);
        window.location.reload();
      } catch (error) {
        toast.error('Failed to switch campaign');
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={selectedCampaign} onValueChange={setSelectedCampaign}>
            {campaigns.map((campaign) => {
              const campaignId = campaign.localId || campaign.id;
              const isCurrent = campaignId === currentCampaignId;
              
              return (
                <div
                  key={campaignId}
                  className="flex items-center space-x-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={campaignId} id={campaignId} />
                  <Label
                    htmlFor={campaignId}
                    className="flex-1 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        {campaign.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {isCurrent && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSwitch}>
              Switch Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
