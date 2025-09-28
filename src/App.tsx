import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sword } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import EntitiesPage from "./pages/EntitiesPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

const queryClient = new QueryClient();

const App = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const handleThoughtAdded = (thought: Thought) => {
    setThoughts(prev => [thought, ...prev]);
  };

  const handleEntityClick = (entity: string) => {
    setSelectedEntity(entity);
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
                    <div className="flex items-center gap-4">
                      <Sword className="h-10 w-10 text-primary" />
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">D&D Chronicle</h1>
                        <p className="text-base text-muted-foreground">Fantasy Adventure Note-Taking</p>
                      </div>
                    </div>
                    <Navigation />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Layout */}
            <main className="flex-1">
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <Index 
                        thoughts={thoughts} 
                        onThoughtAdded={handleThoughtAdded} 
                      />
                    } 
                  />
                  <Route 
                    path="/entities" 
                    element={
                      <EntitiesPage 
                        thoughts={thoughts} 
                        onEntityClick={handleEntityClick} 
                      />
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <HistoryPage 
                        thoughts={thoughts} 
                        onEntityClick={handleEntityClick} 
                      />
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

            {/* Enhanced Footer */}
            <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="container py-6">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="text-xs">💡 Tip: Press Ctrl+Enter to quickly save your thoughts</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>D&D Chronicle v1.0</span>
                      <span>•</span>
                      <span>"Every adventure begins with a single thought"</span>
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
