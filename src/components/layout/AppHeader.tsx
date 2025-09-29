import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, LogOut } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { campaignService } from "@/services/campaignService";
import { LocalCampaign } from "@/types/campaigns";
import { CampaignManagementModal } from "@/components/CampaignManagementModal";

import { toast } from "sonner";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<LocalCampaign | null>(null);
  const [allCampaigns, setAllCampaigns] = useState<LocalCampaign[]>([]);

  useEffect(() => {
    if (user) {
      loadCampaignData();
      
      // Listen for campaign switches
      const handleCampaignSwitch = () => {
        loadCampaignData();
      };
      
      window.addEventListener('campaignSwitched', handleCampaignSwitch);
      return () => window.removeEventListener('campaignSwitched', handleCampaignSwitch);
    }
  }, [user]);

  const loadCampaignData = () => {
    const current = campaignService.getCurrentCampaign();
    const all = campaignService.getUserCampaigns();
    setCurrentCampaign(current);
    setAllCampaigns(all);
  };

  const getDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Successfully signed out');
    }
    setShowConfirmDialog(false);
  };

  const handleCampaignsUpdated = () => {
    loadCampaignData();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="max-w-2xl mx-auto px-4 h-20 grid grid-cols-3 grid-rows-2 gap-2 items-center">
          {/* Row 1, Column 3: User Info & Settings */}
          <div className="grid-row-1 col-start-3 flex items-center gap-2 justify-self-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setShowManagementModal(true)}
                    className="text-sm text-muted-foreground hidden sm:inline hover:text-foreground transition-colors cursor-pointer"
                  >
                    {getDisplayName()}
                    {currentCampaign && (
                      <>, Campaign: <span className="text-foreground font-medium">{currentCampaign.name}</span></>
                    )}
                  </button>
                </TooltipTrigger>
                {currentCampaign && (
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="font-semibold">{currentCampaign.name}</div>
                      {currentCampaign.description && (
                        <div className="text-xs text-muted-foreground">{currentCampaign.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground">{currentCampaign.members.length} member{currentCampaign.members.length !== 1 ? 's' : ''}</div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2, Column 1: Brand */}
          <Link 
            to="/" 
            className="row-start-2 col-start-1 font-bold text-lg text-foreground hover:text-primary transition-colors"
          >
            D&D Chronicle
          </Link>

          {/* Row 2, Columns 2-3: Navigation */}
          <nav className="row-start-2 col-start-2 col-span-2 flex items-center gap-2">
            <Link to="/entities">
              <Button variant="ghost" size="sm">Entities</Button>
            </Link>
            <Link to="/history">
              <Button variant="ghost" size="sm">History</Button>
            </Link>
          </nav>
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />

      {showManagementModal && (
        <CampaignManagementModal
          open={showManagementModal}
          onOpenChange={setShowManagementModal}
          campaigns={allCampaigns}
          onCampaignsUpdated={handleCampaignsUpdated}
        />
      )}
    </header>
  );
};