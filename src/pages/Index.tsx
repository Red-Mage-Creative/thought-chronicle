import { ThoughtManagementPage } from "@/components/layout/ThoughtManagementPage";
import { useState } from "react";

const Index = () => {
  const [defaultTags, setDefaultTags] = useState<string[]>([]);

  return (
    <ThoughtManagementPage
      defaultTags={defaultTags}
      onDefaultTagsChange={setDefaultTags}
    />
  );
};

export default Index;
