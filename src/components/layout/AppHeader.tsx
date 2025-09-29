import { Sword, Settings } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { useState } from "react";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.display_name || user.user_metadata?.username || user.email;
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

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 grid-rows-2 gap-4" style={{gridTemplateAreas: `". . account" "brand nav nav"`}}>
            {/* Account section - Row 1, Column 3 */}
            {user && (
              <div className="flex items-center gap-2 justify-end" style={{gridArea: 'account'}}>
                <span className="text-sm text-muted-foreground">
                  {getDisplayName()}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Brand section - Row 2, Column 1 */}
            <div className="flex items-center gap-3" style={{gridArea: 'brand'}}>
              <Sword className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Chronicle</h1>
            </div>
            
            {/* Navigation section - Row 2, Columns 2-3 */}
            <div className="flex items-center justify-end" style={{gridArea: 'nav'}}>
              <Navigation />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Sign Out"
        description="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmText="Sign Out"
        variant="destructive"
        onConfirm={handleSignOut}
      />
    </header>
  );
};