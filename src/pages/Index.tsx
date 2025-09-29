import { ThoughtManagementPage } from "@/components/layout/ThoughtManagementPage";
import { useState } from "react";

const Index = () => {
  const [defaultTags, setDefaultTags] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <ThoughtManagementPage
        defaultTags={defaultTags}
        onDefaultTagsChange={setDefaultTags}
      />
    </div>
  );
};

export default Index;
