import { EntityDashboard } from "@/components/EntityDashboard";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface EntitiesPageProps {
  thoughts: Thought[];
  onEntityClick?: (entity: string) => void;
}

const EntitiesPage = ({ thoughts, onEntityClick }: EntitiesPageProps) => {
  return (
    <EntityDashboard thoughts={thoughts} onEntityClick={onEntityClick} />
  );
};

export default EntitiesPage;