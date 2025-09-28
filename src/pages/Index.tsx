import { useState } from "react";
import { Sword } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface IndexProps {
  thoughts: Thought[];
  onThoughtAdded: (thought: Thought) => void;
}

const Index = ({ thoughts, onThoughtAdded }: IndexProps) => {
  const existingEntities = Array.from(new Set(thoughts.flatMap(t => t.entities)));

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
        <div className="max-w-2xl mx-auto">
          <ChatWindow 
            onThoughtAdded={onThoughtAdded} 
            existingEntities={existingEntities}
          />
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
