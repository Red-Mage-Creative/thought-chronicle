import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, FileText, User } from 'lucide-react';
import { LocalCampaign } from '@/types/campaigns';
import { CampaignEditForm } from './CampaignEditForm';
import { CampaignDeleteDialog } from './CampaignDeleteDialog';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';

interface CampaignManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: LocalCampaign[];
  onCampaignsUpdated: () => void;
}

export const CampaignManagementModal = ({
  open,
  onOpenChange,
  campaigns,
  onCampaignsUpdated
}: CampaignManagementModalProps) => {
  const [editingCampaign, setEditingCampaign] = useState<LocalCampaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<LocalCampaign | null>(null);

  const handleEditSuccess = () => {
    setEditingCampaign(null);
    onCampaignsUpdated();
    toast.success('Campaign updated successfully');
  };

  const handleDeleteSuccess = () => {
    setDeletingCampaign(null);
    onCampaignsUpdated();
    toast.success('Campaign deleted successfully');
  };

  const canDeleteCampaign = (campaign: LocalCampaign) => {
    return campaigns.length > 1; // Must have at least one campaign
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Campaigns</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const currentCampaign = campaignService.getCurrentCampaign();
              const isCurrentCampaign = currentCampaign?.localId === campaign.localId;
              
              return (
                <Card key={campaign.localId} className={isCurrentCampaign ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          {isCurrentCampaign && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        {campaign.description && (
                          <CardDescription className="mt-1">
                            {campaign.description}
                          </CardDescription>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCampaign(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCampaign(campaign)}
                          disabled={!canDeleteCampaign(campaign)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{campaign.members.length} member{campaign.members.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Created {campaign.created_at.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      {editingCampaign && (
        <Dialog open={true} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
            </DialogHeader>
            <CampaignEditForm
              campaign={editingCampaign}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingCampaign(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Campaign Dialog */}
      {deletingCampaign && (
        <CampaignDeleteDialog
          open={true}
          onOpenChange={() => setDeletingCampaign(null)}
          campaign={deletingCampaign}
          availableCampaigns={campaigns.filter(c => c.localId !== deletingCampaign.localId)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};