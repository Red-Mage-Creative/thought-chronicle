import { EntityManagementPage } from "@/components/layout/EntityManagementPage";
import { MainLayout } from "@/components/layout/MainLayout";

interface EntitiesPageProps {
  onEntityClick?: (entity: string) => void;
}

const EntitiesPage = ({ onEntityClick }: EntitiesPageProps) => {
  return (
    <MainLayout>
      <EntityManagementPage onEntityClick={onEntityClick} />
    </MainLayout>
  );
};

export default EntitiesPage;