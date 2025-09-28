import { ChatWindow } from "@/components/ChatWindow";
import { StatsCard } from "@/components/StatsCard";
import { useLocalThoughts } from "@/hooks/useOfflineData";

interface IndexProps {
  defaultTags: string[];
  onDefaultTagsChange: (tags: string[]) => void;
}

const Index = ({ defaultTags, onDefaultTagsChange }: IndexProps) => {
  const { thoughts } = useLocalThoughts();

  return (
    <>
      <StatsCard thoughts={thoughts} />
      <ChatWindow 
        defaultTags={defaultTags}
        onDefaultTagsChange={onDefaultTagsChange}
      />
    </>
  );
};

export default Index;
