import { Brain, Users, Calendar, Palette, FileText } from "lucide-react";
import { useThoughts } from '@/hooks/useThoughts';
import { useEntities } from '@/hooks/useEntities';

export const AppFooter = () => {
  // Use live data from hooks for real-time updates
  const { thoughts } = useThoughts();
  const { entities } = useEntities();
  
  const totalThoughts = thoughts.length;
  const uniqueEntities = entities.length;
  const recentThoughts = thoughts.filter(
    t => Date.now() - t.timestamp.getTime() < 24 * 60 * 60 * 1000
  ).length;

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="text-xs">
              <div className="font-medium">Chronicle - A TTRPG note-taking application.</div>
              <div className="font-medium">
                <a 
                  href="/changelog" 
                  className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline font-medium"
                >
                  <FileText className="h-3 w-3" />
                  Version 1.2.1
                </a>
              </div>
              <br />
              <div className="italic">"Every adventure begins with a single thought"</div>
              <br />
              <div className="text-xs">Built with Lovable.</div>
            </div>
            
            <div className="text-xs text-right space-y-2">
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-primary" />
                  <span className="font-medium">{totalThoughts}</span>
                  <span className="text-muted-foreground">thoughts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="font-medium">{uniqueEntities}</span>
                  <span className="text-muted-foreground">entities</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span className="font-medium">{recentThoughts}</span>
                  <span className="text-muted-foreground">today</span>
                </div>
              </div>
              <div>
                💡 Tip: Press Ctrl+Enter to quickly save your thoughts
              </div>
              <div className="flex gap-4 text-xs justify-end mt-2">
                <a 
                  href="/design-system" 
                  className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline font-medium"
                >
                  <Palette className="h-3 w-3" />
                  Design System
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};