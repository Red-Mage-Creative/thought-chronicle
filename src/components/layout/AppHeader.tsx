import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings as SettingsIcon } from "lucide-react";
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

  useEffect(() => {
    if (user) {
      loadCurrentCampaign();
      
      // Listen for campaign switches
      const handleCampaignSwitch = () => {
        loadCurrentCampaign();
      };
      
      window.addEventListener('campaignSwitched', handleCampaignSwitch);
      return () => window.removeEventListener('campaignSwitched', handleCampaignSwitch);
    }
  }, [user]);

  const loadCurrentCampaign = () => {
    const current = campaignService.getCurrentCampaign();
    setCurrentCampaign(current);
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
    loadCurrentCampaign();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left: Brand */}
        <Link 
          to="/" 
          className="font-bold text-lg text-foreground hover:text-primary transition-colors"
        >
          D&D Chronicle
        </Link>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-2">
          <Link to="/entities">
            <Button variant="ghost" size="sm">Entities</Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" size="sm">History</Button>
          </Link>
        </nav>

        {/* Right: User Info & Settings */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {getDisplayName()}
            {currentCampaign && (
              <>, Campaign: <span className="text-foreground font-medium">{currentCampaign.name}</span></>
            )}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowManagementModal(true)}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Campaign Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          campaigns={campaignService.getUserCampaigns()}
          onCampaignsUpdated={handleCampaignsUpdated}
        />
      )}
    </header>
  );
};