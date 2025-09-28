import { ChatWindow } from "@/components/ChatWindow";
import { StatsCard } from "@/components/StatsCard";

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
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <StatsCard thoughts={thoughts} />
      </div>
      
      <div className="max-w-2xl mx-auto mb-6">
        <ChatWindow 
          onThoughtAdded={onThoughtAdded} 
          existingEntities={existingEntities}
        />
      </div>
    </div>
  );
};

export default Index;
