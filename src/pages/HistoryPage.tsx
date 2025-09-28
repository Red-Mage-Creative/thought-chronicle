import { ThoughtsList } from "@/components/ThoughtsList";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface HistoryPageProps {
  onEntityClick?: (entity: string) => void;
}

const HistoryPage = ({ onEntityClick }: HistoryPageProps) => {
  return (
    <ThoughtsList onEntityClick={onEntityClick} />
  );
};

export default HistoryPage;