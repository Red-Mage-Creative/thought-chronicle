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
    <ThoughtsList thoughts={thoughts} onEntityClick={onEntityClick} />
  );
};

export default HistoryPage;