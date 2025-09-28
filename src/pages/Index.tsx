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
    <div className="container py-6">
      <StatsCard thoughts={thoughts} />
      <ChatWindow 
        onThoughtAdded={onThoughtAdded} 
        existingEntities={existingEntities}
      />
    </div>
  );
};

export default Index;
