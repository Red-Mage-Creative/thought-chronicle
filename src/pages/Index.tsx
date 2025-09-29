import { ThoughtManagementPage } from "@/components/layout/ThoughtManagementPage";

interface IndexProps {
  defaultTags?: string[];
  onDefaultTagsChange?: (tags: string[]) => void;
}

const Index = ({ defaultTags = [], onDefaultTagsChange }: IndexProps) => {
  return (
    <ThoughtManagementPage
      defaultTags={defaultTags}
      onDefaultTagsChange={onDefaultTagsChange}
    />
  );
};

export default Index;
