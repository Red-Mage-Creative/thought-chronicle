import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import EntitiesPage from "./pages/EntitiesPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";
import { useLocalThoughts, useOfflineSync } from "./hooks/useOfflineData";
import { syncService } from "./services/syncService";
import { toast } from "sonner";


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

  const handleThoughtAdded = (newThought: any) => {
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
          <AppLayout>
            <Routes>
              <Route 
                path="/" 
                element={<Index />} 
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
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;