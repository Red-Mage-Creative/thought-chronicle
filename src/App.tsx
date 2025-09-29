import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useThoughts } from "@/hooks/useThoughts";
import Index from "./pages/Index";
import EntitiesPage from "./pages/EntitiesPage";
import EntityDetailsPage from "./pages/EntityDetailsPage";
import HistoryPage from "./pages/HistoryPage";
import PendingChangesPage from "./pages/PendingChangesPage";
import DesignSystemPage from "./pages/DesignSystemPage";
import ChangelogPage from "./pages/ChangelogPage";
import NotFound from "./pages/NotFound";
import { useOfflineSync } from "./hooks/useOfflineData";
import { syncService } from "./services/syncService";
import { dataMigrationService } from "./services/dataMigrationService";
import { toast } from "sonner";


const queryClient = new QueryClient();

const App = () => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [defaultTags, setDefaultTags] = useState<string[]>([]);
  
  const { refreshSyncStatus } = useOfflineSync();
  
  // Run data migrations on app start
  useEffect(() => {
    dataMigrationService.runMigrations();
  }, []);
  const { thoughts: allThoughts } = useThoughts();

  // Load default tags from localStorage on mount
  useEffect(() => {
    const savedDefaultTags = localStorage.getItem('chronicle-default-tags');
    if (savedDefaultTags) {
      setDefaultTags(JSON.parse(savedDefaultTags));
    }
  }, []);


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
          <Routes>
              <Route 
                path="/" 
                element={
                  <AppLayout variant="narrow" defaultTags={defaultTags} onDefaultTagsChange={handleDefaultTagsChange}>
                    <Index />
                  </AppLayout>
                } 
              />
              <Route 
                path="/entities" 
                element={
                  <AppLayout variant="narrow">
                    <EntitiesPage 
                      onEntityClick={handleEntityClick} 
                    />
                  </AppLayout>
                } 
              />
              <Route 
                path="/entities/:entityName" 
                element={
                  <AppLayout variant="narrow">
                    <EntityDetailsPage 
                      onEntityClick={handleEntityClick} 
                    />
                  </AppLayout>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <AppLayout variant="narrow">
                    <HistoryPage 
                      onEntityClick={handleEntityClick} 
                    />
                  </AppLayout>
                } 
              />
              <Route 
                path="/pending-changes" 
                element={
                  <AppLayout variant="narrow">
                    <PendingChangesPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/design-system" 
                element={
                  <AppLayout variant="wide">
                    <DesignSystemPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/changelog" 
                element={
                  <AppLayout variant="narrow">
                    <ChangelogPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="*" 
                element={
                  <AppLayout variant="narrow">
                    <NotFound />
                  </AppLayout>
                } 
              />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;