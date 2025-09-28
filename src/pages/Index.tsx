import { useState } from "react";
import { Sword, BookOpen, Search } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { EntityDashboard } from "@/components/EntityDashboard";
import { ThoughtsList } from "@/components/ThoughtsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

const Index = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const handleThoughtAdded = (thought: Thought) => {
    setThoughts(prev => [thought, ...prev]);
  };

  const handleEntityClick = (entity: string) => {
    setSelectedEntity(entity);
    // Scroll to thoughts tab or show filtered thoughts
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Sword className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">D&D Chronicle</h1>
              <p className="text-sm text-muted-foreground">Fantasy Adventure Note-Taking</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-120px)]">
          {/* Chat Window - Always visible */}
          <div className="lg:col-span-1">
            <ChatWindow onThoughtAdded={handleThoughtAdded} />
          </div>

          {/* Dashboard/Search Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="entities" className="h-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-border">
                <TabsTrigger 
                  value="entities" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Entity Registry
                </TabsTrigger>
                <TabsTrigger 
                  value="thoughts"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Chronicle History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entities" className="mt-4 h-full">
                <EntityDashboard 
                  thoughts={thoughts} 
                  onEntityClick={handleEntityClick}
                />
              </TabsContent>

              <TabsContent value="thoughts" className="mt-4 h-full">
                <ThoughtsList 
                  thoughts={thoughts} 
                  onEntityClick={handleEntityClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Stats Footer */}
        <footer className="mt-8 p-4 bg-muted/20 border border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex gap-6">
              <span>Total Thoughts: {thoughts.length}</span>
              <span>Unique Entities: {new Set(thoughts.flatMap(t => t.entities)).size}</span>
            </div>
            <div className="text-xs">
              Use #tags in your thoughts to create trackable entities
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
