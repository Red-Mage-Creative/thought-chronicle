import { EntityDashboard } from "@/components/EntityDashboard";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface EntitiesPageProps {
  onEntityClick?: (entity: string) => void;
}

const EntitiesPage = ({ onEntityClick }: EntitiesPageProps) => {
  return (
    <EntityDashboard onEntityClick={onEntityClick} />
  );
};

export default EntitiesPage;