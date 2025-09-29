import { useNavigate } from 'react-router-dom';
import { EntityManagementPage } from "@/components/layout/EntityManagementPage";

interface EntitiesPageProps {
  onEntityClick?: (entity: string) => void;
}

const EntitiesPage = ({ onEntityClick }: EntitiesPageProps) => {
  const navigate = useNavigate();

  const handleEntityClick = (entityName: string) => {
    // Navigate to entity details page
    navigate(`/entities/${encodeURIComponent(entityName)}`);
    // Also call the original handler for any other functionality
    onEntityClick?.(entityName);
  };

  return (
    <EntityManagementPage onEntityClick={handleEntityClick} />
  );
};

export default EntitiesPage;