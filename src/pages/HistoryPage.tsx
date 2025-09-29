import { HistoryPage as HistoryPageLayout } from "@/components/layout/HistoryPage";
import { MainLayout } from "@/components/layout/MainLayout";

interface HistoryPageProps {
  onEntityClick?: (entity: string) => void;
}

const HistoryPage = ({ onEntityClick }: HistoryPageProps) => {
  return (
    <MainLayout>
      <HistoryPageLayout onEntityClick={onEntityClick} />
    </MainLayout>
  );
};

export default HistoryPage;