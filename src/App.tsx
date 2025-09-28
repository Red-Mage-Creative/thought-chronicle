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
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sword className="h-8 w-8 text-primary" />
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">D&D Chronicle</h1>
                      <p className="text-sm text-muted-foreground">Fantasy Adventure Note-Taking</p>
                    </div>
                  </div>
                  <Navigation />
                </div>
              </div>
            </header>

            {/* Main Layout */}
            <div className="flex">
              <Navigation />
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
            </div>

            {/* Stats Footer */}
            <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex gap-6">
                    <span>Total Thoughts: {thoughts.length}</span>
                    <span>Unique Entities: {new Set(thoughts.flatMap(t => t.entities)).size}</span>
                  </div>
                  <div className="text-xs">
                    Use #tags in your thoughts to create trackable entities
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
