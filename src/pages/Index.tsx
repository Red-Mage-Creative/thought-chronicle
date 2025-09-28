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
  defaultTags: string[];
  onDefaultTagsChange: (tags: string[]) => void;
}

const Index = ({ thoughts, onThoughtAdded, defaultTags, onDefaultTagsChange }: IndexProps) => {
  const existingEntities = Array.from(new Set(thoughts.flatMap(t => t.entities)));

  return (
    <>
      <StatsCard thoughts={thoughts} />
      <ChatWindow 
        onThoughtAdded={onThoughtAdded} 
        existingEntities={existingEntities}
        defaultTags={defaultTags}
        onDefaultTagsChange={onDefaultTagsChange}
      />
    </>
  );
};

export default Index;
