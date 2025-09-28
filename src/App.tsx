import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sword } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { SyncBanner } from "@/components/SyncBanner";
import Index from "./pages/Index";
import EntitiesPage from "./pages/EntitiesPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";
import { useLocalThoughts, useOfflineSync } from "./hooks/useOfflineData";
import { syncService } from "./services/syncService";
import { toast } from "sonner";

interface Thought {
  id: string;
  content: string;
  relatedEntities: string[];
  timestamp: Date;
  gameDate?: string;
}

const queryClient = new QueryClient();

const App = () => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [defaultTags, setDefaultTags] = useState<string[]>([]);
  
  const { thoughts, addThought } = useLocalThoughts();
  const { refreshSyncStatus } = useOfflineSync();

  // Load default tags from localStorage on mount
  useEffect(() => {
    const savedDefaultTags = localStorage.getItem('chronicle-default-tags');
    if (savedDefaultTags) {
      setDefaultTags(JSON.parse(savedDefaultTags));
    }
  }, []);

  const handleThoughtAdded = (newThought: Thought) => {
    addThought({
      id: newThought.id,
      content: newThought.content,
      relatedEntities: newThought.relatedEntities,
      timestamp: newThought.timestamp,
      gameDate: newThought.gameDate
    });
    refreshSyncStatus();
  };

  const handleDefaultTagsChange = (newDefaultTags: string[]) => {
    setDefaultTags(newDefaultTags);
    localStorage.setItem('chronicle-default-tags', JSON.stringify(newDefaultTags));
  };

  const handleEntityClick = (entity: string) => {
    setSelectedEntity(entity);
  };

  const handleSync = async () => {
    const result = await syncService.syncToServer();
    if (result.success) {
      toast.success(result.message);
      refreshSyncStatus();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="container py-8">
                <div className="max-w-2xl mx-auto">
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
              </div>
            </header>

            {/* Sync Banner */}
            <SyncBanner onSync={handleSync} />

            {/* Main Layout */}
            <main className="flex-1 container py-8">
              <div className="max-w-2xl mx-auto">
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <Index 
                            defaultTags={defaultTags}
                            onDefaultTagsChange={handleDefaultTagsChange}
                          />
                        } 
                      />
                  <Route 
                    path="/entities" 
                    element={
                      <EntitiesPage 
                        onEntityClick={handleEntityClick} 
                      />
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <HistoryPage 
                        onEntityClick={handleEntityClick} 
                      />
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>

            {/* Enhanced Footer */}
            <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="container py-6">
                <div className="max-w-2xl mx-auto">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="text-xs">
                      <div className="font-medium">D&D Chronicle</div>
                      <div className="font-medium">Version 1.0</div>
                      <br />
                      <div className="italic">"Every adventure begins with a single thought"</div>
                      <br />
                      <div className="text-xs">Built with Lovable.</div>
                    </div>
                    <div className="text-xs">
                      <span>💡 Tip: Press Ctrl+Enter to quickly save your thoughts</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;