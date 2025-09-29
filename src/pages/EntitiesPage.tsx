import { EntityManagementPage } from "@/components/layout/EntityManagementPage";

interface EntitiesPageProps {
  onEntityClick?: (entity: string) => void;
}

const EntitiesPage = ({ onEntityClick }: EntitiesPageProps) => {
  return (
    <EntityManagementPage onEntityClick={onEntityClick} />
  );
};

export default EntitiesPage;