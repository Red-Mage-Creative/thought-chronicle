import { ThoughtsList } from "@/components/ThoughtsList";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface HistoryPageProps {
  thoughts: Thought[];
  onEntityClick?: (entity: string) => void;
}

const HistoryPage = ({ thoughts, onEntityClick }: HistoryPageProps) => {
  return (
    <div className="container py-8">
      <ThoughtsList thoughts={thoughts} onEntityClick={onEntityClick} />
    </div>
  );
};

export default HistoryPage;