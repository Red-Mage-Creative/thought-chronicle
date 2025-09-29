import { HistoryPage as HistoryPageLayout } from "@/components/layout/HistoryPage";

interface HistoryPageProps {
  onEntityClick?: (entity: string) => void;
}

const HistoryPage = ({ onEntityClick }: HistoryPageProps) => {
  return (
    <HistoryPageLayout onEntityClick={onEntityClick} />
  );
};

export default HistoryPage;