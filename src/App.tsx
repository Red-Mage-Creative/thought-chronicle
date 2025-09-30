import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AppInitializer } from "@/components/AppInitializer";
import { useThoughts } from "@/hooks/useThoughts";
import Index from "./pages/Index";
import EntitiesPage from "./pages/EntitiesPage";
import EntityDetailsPage from "./pages/EntityDetailsPage";
import HistoryPage from "./pages/HistoryPage";
import PendingChangesPage from "./pages/PendingChangesPage";
import MigrationHistoryPage from "./pages/MigrationHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import DesignSystemPage from "./pages/DesignSystemPage";
import ChangelogPage from "./pages/ChangelogPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookieControlsPage from "./pages/CookieControlsPage";
import AuthPage from "./pages/AuthPage";
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
        <AuthProvider>
          <AppInitializer>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow" defaultTags={defaultTags} onDefaultTagsChange={handleDefaultTagsChange}>
                      <Index />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              <Route 
                path="/entities" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <EntitiesPage 
                        onEntityClick={handleEntityClick} 
                      />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              <Route 
                path="/entities/:entityName" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <EntityDetailsPage 
                        onEntityClick={handleEntityClick} 
                      />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <HistoryPage 
                        onEntityClick={handleEntityClick} 
                      />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              <Route 
                path="/pending-changes" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <PendingChangesPage />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              <Route 
                path="/migration-history" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <MigrationHistoryPage />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <SettingsPage />
                    </AppLayout>
                  </AuthGuard>
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
                path="/privacy-policy" 
                element={
                  <AppLayout variant="narrow">
                    <PrivacyPolicyPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/terms-of-service" 
                element={
                  <AppLayout variant="narrow">
                    <TermsOfServicePage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/cookie-controls" 
                element={
                  <AppLayout variant="narrow">
                    <CookieControlsPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="*" 
                element={
                  <AuthGuard>
                    <AppLayout variant="narrow">
                      <NotFound />
                    </AppLayout>
                  </AuthGuard>
                } 
              />
              </Routes>
            </BrowserRouter>
          </AppInitializer>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;