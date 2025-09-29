import { Sword } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export const AppHeader = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sword className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">D&D Chronicle</h1>
              <p className="text-sm text-muted-foreground">Fantasy Adventure Note-Taking</p>
            </div>
          </div>
          <Navigation />
        </div>
      </div>
    </header>
  );
};