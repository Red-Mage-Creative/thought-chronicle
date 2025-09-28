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
    <div className="container py-6">
      <EntityDashboard thoughts={thoughts} onEntityClick={onEntityClick} />
    </div>
  );
};

export default EntitiesPage;