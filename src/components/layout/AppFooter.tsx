import { Brain, Users, Calendar } from "lucide-react";
import { LocalThought } from '@/types/thoughts';

interface AppFooterProps {
  thoughts?: LocalThought[];
}

export const AppFooter = ({ thoughts = [] }: AppFooterProps) => {
  const totalThoughts = thoughts.length;
  const uniqueEntities = new Set(thoughts.flatMap(t => t.relatedEntities)).size;
  const recentThoughts = thoughts.filter(
    t => Date.now() - t.timestamp.getTime() < 24 * 60 * 60 * 1000
  ).length;

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div className="text-xs">
              <div className="font-medium">D&D Chronicle</div>
              <div className="font-medium">Version 1.0</div>
              <br />
              <div className="italic">"Every adventure begins with a single thought"</div>
              <br />
              <div className="text-xs">Built with Lovable.</div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-6 text-xs">
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
            </div>
            
            <div className="text-xs text-right">
              <span>💡 Tip: Press Ctrl+Enter to quickly save your thoughts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};