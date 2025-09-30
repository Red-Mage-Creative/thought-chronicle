import { Brain, Users, Calendar, Palette, FileText, Shield, ScrollText, Cookie } from "lucide-react";
import { useThoughts } from '@/hooks/useThoughts';
import { useEntities } from '@/hooks/useEntities';
import { useAuth } from '@/contexts/AuthContext';

export const AppFooter = () => {
  const { user } = useAuth();
  
  // Use live data from hooks for real-time updates (only when authenticated)
  const { thoughts } = useThoughts();
  const { entities } = useEntities();
  
  const totalThoughts = user ? thoughts.length : 0;
  const uniqueEntities = user ? entities.length : 0;
  const recentThoughts = user ? thoughts.filter(
    t => Date.now() - t.timestamp.getTime() < 24 * 60 * 60 * 1000
  ).length : 0;

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container py-4 sm:py-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-sm text-muted-foreground place-items-center text-center md:text-left md:place-items-start">
            
            {/* Brand & Info */}
            <div className="text-xs space-y-2 sm:space-y-3">
              <div>
                <div className="font-medium text-foreground mb-1">Chronicle</div>
                <div className="text-muted-foreground">A TTRPG note-taking application</div>
                <div className="italic mt-1 text-[10px] sm:text-xs">"Every adventure begins with a single thought"</div>
              </div>
              <div className="font-medium">
                <a 
                  href="/changelog" 
                  className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  Alpha - Version 0.7.0
                </a>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground/70">Built with Lovable</div>
            </div>

            {/* Stats & Tips (only when logged in) */}
            <div className="text-xs space-y-2 sm:space-y-3 sm:col-span-1 md:col-span-1">
              {user && (
                <>
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">Your Chronicle</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <Brain className="h-3 w-3 text-primary" />
                        <span className="font-medium">{totalThoughts}</span>
                        <span>thoughts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="font-medium">{uniqueEntities}</span>
                        <span>entities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span className="font-medium">{recentThoughts}</span>
                        <span>today</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">Quick Tip</div>
                    <div>💡 Press Ctrl+Enter to quickly save thoughts</div>
                  </div>
                </>
              )}
            </div>

            {/* Links */}
            <div className="text-xs space-y-2 sm:space-y-3 col-span-1 sm:col-span-2 md:col-span-1 md:justify-self-end">
              <div className="space-y-2">
                <div className="font-medium text-foreground">Resources</div>
                <div className="flex flex-col gap-1">
                  <a 
                    href="/design-system" 
                    className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline w-fit"
                  >
                    <Palette className="h-3 w-3" />
                    Design System
                  </a>
                  <a 
                    href="/changelog" 
                    className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline w-fit"
                  >
                    <FileText className="h-3 w-3" />
                    Changelog
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-foreground">Legal</div>
                <div className="flex flex-col gap-1">
                  <a 
                    href="/privacy-policy" 
                    className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline w-fit"
                  >
                    <Shield className="h-3 w-3" />
                    Privacy Policy
                  </a>
                  <a 
                    href="/terms-of-service" 
                    className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline w-fit"
                  >
                    <ScrollText className="h-3 w-3" />
                    Terms of Service
                  </a>
                  <a 
                    href="/cookie-controls" 
                    className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline w-fit"
                  >
                    <Cookie className="h-3 w-3" />
                    Cookie Controls
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};